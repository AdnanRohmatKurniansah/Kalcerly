import swaggerJsdoc from 'swagger-jsdoc'

const options: swaggerJsdoc.Options = {
  apis: ['./src/routes/*.ts']
}

export const swaggerSpec = swaggerJsdoc(options)