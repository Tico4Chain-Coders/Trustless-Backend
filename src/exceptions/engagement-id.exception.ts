import { HttpException, HttpStatus } from '@nestjs/common';

export class EngagementIdException extends HttpException {
    constructor() {
        super(
            {
                response: {
                    status: HttpStatus.BAD_REQUEST,
                    error: 'Engagement ID cannot be empty',
                },
            },
            HttpStatus.BAD_REQUEST,
        );
    }
}