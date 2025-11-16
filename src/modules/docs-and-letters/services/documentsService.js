import documentRepository from '../repositories/documentRepository';
import auditService from '../../../shared/services/audit/auditService';

class DocumentService {
  async createDocument(data, user) {
    // buisness logic validation
    if (data.confidentialityLevel > user.clearanceLevel) {
      throw new Error('Insufficent clearance level');
    }
    const document = await documentRepository.create(data, user.id);

    // Audit logging
    await auditService.log({
      userId: user.id,
      action: 'DOCUMENT_CREATED',
      entityType: 'Document',
      entityId: document.id,
      changes: data,
      ipAddress: user.ipAddress,
      userAgent: user.userAgent,
    });
    return document;
  }

  async getDocument(id, user) {
    const document = await documentRepository.findById(id);

    if (!document) {
      throw new NotFoundError('Document not found');
    }

    // Permission check
    if (!this.canAccessDocument(document, user)) {
      throw new ForbiddenError('Access denied');
    }

    // Audit read access for sensitive documents
    if (document.confidentialityLevel >= 3) {
      await auditService.log({
        userId: user.id,
        action: 'DOCUMENT_ACCESSED',
        entityType: 'Document',
        entityId: document.id,
        metadata: { confidentialityLevel: document.confidentialityLevel },
      });
    }

    return document;
  }

  canAccessDocument(document, user) {
    // Owner can always access
    if (document.createdBy === user.id) return true;

    // Check permissions
    if (user.permissions.includes(PERMISSIONS.DOCUMENTS.READ_ALL)) return true;

    // Check department access
    if (document.department === user.department) return true;

    // Check explicit shares
    if (document.sharedWith?.includes(user.id)) return true;

    return false;
  }

  canEditDocument(document, user) {
    if (document.createdBy === user.id) return true;
    if (user.permissions.includes(PERMISSIONS.DOCUMENTS.WRITE_ALL)) return true;
    return false;
  }
}
