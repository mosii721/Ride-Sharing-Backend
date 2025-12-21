// import { ArgumentsHost, Catch, HttpException, HttpStatus } from "@nestjs/common";
// import { BaseExceptionFilter } from "@nestjs/core";
// import { Request,Response } from "express";
// // import { LogsService } from "./logs/logs.service";

// interface MyResponseObj {
//     statusCode: number;
//     timestamp: string;
//     path:string;
//     response: string | object;
// }

// @Catch()
// export class AllExceptionsFilter extends BaseExceptionFilter {

//     private readonly logs = new LogsService();

//     private getClientIp(request: Request): string {
//         const forwardedFor = request.headers['x-forwarded-for'];
//         if(forwardedFor){
//             return Array.isArray(forwardedFor)
//                 ? forwardedFor[0]
//                 : forwardedFor.split(',')[0].trim();
//         }

//         return request.ip || 'unknown';
//     }

//     override catch(exception: unknown, host: ArgumentsHost) {
//         const ctx = host.switchToHttp();
//         const request = ctx.getRequest<Request>();
//         const response = ctx.getResponse<Response>();
//         const clientIp = this.getClientIp(request);

//         const myResponseObj: MyResponseObj = {
//             statusCode:HttpStatus.INTERNAL_SERVER_ERROR,
//             timestamp: new Date().toISOString(),
//             path: request.url,
//             response: '',
//         };

//         if(exception instanceof HttpException){
//             myResponseObj.statusCode = exception.getStatus();
//             myResponseObj.response = exception.getResponse();
//         }else if(exception instanceof Error){
//             myResponseObj.response = exception.message;
//         }else{
//             myResponseObj.response = 'Internal server error';
//         }

//         response.status(myResponseObj.statusCode).json(myResponseObj);

//         const logMessage=
//         typeof myResponseObj.response === 'string'
//             ? myResponseObj.response
//             :JSON.stringify(myResponseObj.response);
//         void this.logs.logToFile(
//             `ERROR: ${logMessage} -path: ${request.url}`,
//             clientIp,
//         );
//     }

// }

import {
  ArgumentsHost,
  Catch,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Request, Response } from 'express';

interface MyResponseObj {
  statusCode: number;
  timestamp: string;
  path: string;
  response: string | object;
}

@Catch() // Catches all exceptions
export class AllExceptionsFilter extends BaseExceptionFilter {
  private getClientIp(request: Request): string {
    const forwardedFor = request.headers['x-forwarded-for'];
    if (forwardedFor) {
      return Array.isArray(forwardedFor)
        ? forwardedFor[0]
        : forwardedFor.split(',')[0].trim();
    }
    return request.ip || 'unknown';
  }

  override catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const clientIp = this.getClientIp(request);

    const myResponseObj: MyResponseObj = {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      timestamp: new Date().toISOString(),
      path: request.url,
      response: '',
    };

    if (exception instanceof HttpException) {
      myResponseObj.statusCode = exception.getStatus();
      myResponseObj.response = exception.getResponse();
    } else if (exception instanceof Error) {
      myResponseObj.response = exception.message;
    } else {
      myResponseObj.response = 'Internal server error';
    }

    // Send formatted error response to client
    response.status(myResponseObj.statusCode).json(myResponseObj);

    // === LOGGING PART: Using console.error (best for Render/free hosting) ===
    const logMessage =
      typeof myResponseObj.response === 'string'
        ? myResponseObj.response
        : JSON.stringify(myResponseObj.response);

    const fullLog = `[ERROR] ${myResponseObj.timestamp} | IP: ${clientIp} | Path: ${request.url} | Message: ${logMessage}`;

    // This will appear clearly in Render logs (and any other hosting platform)
    console.error(fullLog);

    // Optional: Also log the full exception stack for easier debugging
    if (exception instanceof Error) {
      console.error('Stack trace:', exception.stack);
    }
  }
}