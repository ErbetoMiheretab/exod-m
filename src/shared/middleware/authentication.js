import jwt from 'jsonwebtoken'
import config from '../../config/env'

const authenticate = async (req, res, next) =>{
    try {
        const token = extractToken(req)
        if (!token){
            throw new Error('No token provided')
        }

        const decoded = jwt.verify(token,config )

        //Fetch user with permissions
        const user  = await 
    } catch (error) {
        
    }
}