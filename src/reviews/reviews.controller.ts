import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/role.decorator';
import { Role } from 'src/users/entities/user.entity';
import { RolesGuard } from 'src/auth/guards';

@ApiTags('reviews')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Roles(Role.ADMIN,Role.CUSTOMER)
  @Post()
  create(@Body() createReviewDto: CreateReviewDto) {
    return this.reviewsService.create(createReviewDto);
  }

   @ApiQuery({
      required: false,
      description: 'Get all reviews'
    })
  @Roles(Role.ADMIN,Role.CUSTOMER,Role.DRIVER)
  @Get()
  findAll() {
    return this.reviewsService.findAll();
  }

  @Roles(Role.ADMIN,Role.CUSTOMER,Role.DRIVER)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reviewsService.findOne(id);
  }

  @Roles(Role.ADMIN,Role.CUSTOMER)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateReviewDto: UpdateReviewDto) {
    return this.reviewsService.update(id, updateReviewDto);
  }

  @Roles(Role.ADMIN,Role.CUSTOMER)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.reviewsService.remove(id);
  }
}
