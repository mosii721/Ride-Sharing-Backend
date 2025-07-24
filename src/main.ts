import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bodyParser from 'body-parser';
import * as express from 'express';
import helmet from 'helmet';
import { AllExceptionsFilter } from './http-exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());
  app.enableCors({
    origin:'*',// accept request from any domains origin : 'deployedapp.com',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Accept,Authorization,X-Requested-with',
    credentials:true,
  });

   // Enable raw body for webhook route only
  app.use('/api/v1/payments/webhook', express.raw({
  type: 'application/json',
  verify: (req, res, buf) => {
    // 👇 Save rawBody to use later in controller
    (req as any).rawBody = buf;
  },
}));/////////////////////////////

  app.setGlobalPrefix('api/v1')//api versioning
  app.useGlobalPipes(new ValidationPipe());

  const configService =app.get(ConfigService);
  const PORT=configService.getOrThrow<number>('PORT');

  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapter));

  app.use(bodyParser.json({ limit: '10mb' }));
  app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

  const config = new DocumentBuilder().setTitle('Ride Sharing API')
    .setDescription('This is an API for ride sharing,')
    .setVersion('1.0')
    .addTag('auth','Authentication Endpoints')
    .addTag('bookings','Booking Managment Endpoints')
    .addTag('drivers','Driver Managment Endpoints')
    .addTag('notifications','Notification Managment Endpoints')
    .addTag('payments','Payment Managment Endpoints')
    .addTag('reviews','Review Managment Endpoints')
    .addTag('routes','Route Managment Endpoints')
    .addTag('users','User Managment Endpoints')
    .addTag('vehicles','Vehicle Managment Endpoints')
    .addBearerAuth()
    // .addServer('http://localhost:8000/','Local Development Server')
    // .addServer('http://api.hostel.com/','Production Server')
    .build();

    const documentFactory = SwaggerModule.createDocument(app,config);
    SwaggerModule.setup('api/docs', app, documentFactory,{
    jsonDocumentUrl: 'api/api-json',
    swaggerOptions:{
      persistAuthorization: true,
      tagsSorter: 'alpha', // sort tags alphabetically
      operationsSorter: 'alpha',
      docExpansion: 'none', // collapse all sections 
      filter:true,
    },
    customCss:`
    .swagger-ui .topbar { display:none; }
    `,
    customSiteTitle: 'Documentacion de la API del Montar Sharing'
    });

  await app.listen(PORT,'0.0.0.0', ()  =>{
    console.log(`server is  running on http://localhost:${PORT}`);
  });
}
bootstrap();
