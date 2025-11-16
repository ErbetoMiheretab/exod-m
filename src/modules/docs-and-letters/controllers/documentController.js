const documentService = require('../services/documentService');
const { asyncHandler } = require('../../../shared/utils/asyncHandler');
const { successResponse } = require('../../../shared/utils/responses').default.default;

class DocumentController {
  create = asyncHandler(async (req, res) => {
    const document = await documentService.createDocument(req.body, req.user);
    
    successResponse(res, document, 'Document created successfully', 201);
  });

  getById = asyncHandler(async (req, res) => {
    const document = await documentService.getDocument(req.params.id, req.user);
    
    successResponse(res, document);
  });

  getAll = asyncHandler(async (req, res) => {
    const { page, limit, type, status, search } = req.query;
    
    const result = await documentService.getDocuments(
      { type, status, search },
      { page: parseInt(page), limit: parseInt(limit) },
      req.user
    );
    
    successResponse(res, result);
  });

  update = asyncHandler(async (req, res) => {
    const document = await documentService.updateDocument(
      req.params.id,
      req.body,
      req.user
    );
    
    successResponse(res, document, 'Document updated successfully');
  });

  delete = asyncHandler(async (req, res) => {
    await documentService.deleteDocument(req.params.id, req.user);
    
    successResponse(res, null, 'Document deleted successfully', 204);
  });
}

module.exports = new DocumentController();