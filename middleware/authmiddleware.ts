import {NextFunction, Request, Response} from 'express';
import jwt from 'jsonwebtoken';

//creating custom request type in for user profile security
export interface AuthRequest extends Request{
    user?: {id: string};
}

export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction): any =>{
    const authHeader = req.headers.authorization;
    
    if(!authHeader || !authHeader?.startsWith('Bearer')) {
        return res.status(401).json({message: "Access Denied: No token provided"})
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {id: string};

        req.user = decoded;

        next();
    } catch (error) {
        return res.status(401).json({message: "Access denied. Invalid or expired token"})
    }
}