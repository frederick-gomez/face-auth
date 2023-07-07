import jwt from 'jsonwebtoken';

interface ExtendedToken extends jwt.JwtPayload {
  ci: string
}

const verifyToken = (token: string) => {
  const tokenKey = process.env.JWT_KEY!
  const payload = jwt.verify(token, tokenKey) as ExtendedToken;

  if (payload instanceof jwt.JsonWebTokenError) {
    return payload
  } else {
    return payload
  }
}

export { verifyToken }