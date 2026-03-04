import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
  UseInterceptors,
  ParseIntPipe,
  UploadedFile,
  Query,
  BadRequestException,
  Patch,
  ParseBoolPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../../common/guard/jwt-auth.guard';
import { RolesGuard } from '../../common/guard/roles.guard';
import { Roles } from '../../common/decorator/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express/multer/interceptors/file.interceptor';
import { diskStorage } from 'multer';
import { extname } from 'path/win32';
import { UpdateUserDto } from '../../model/dto/user.dto';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async findAll(
    @Query() query: { page?: string; limit?: string; search?: string },
  ) {
    const page = query.page ? Math.max(1, parseInt(query.page)) : 1;
    const limit = query.limit
      ? Math.min(100, Math.max(1, parseInt(query.limit)))
      : 10;
    const search = query.search?.trim() || '';

    return this.userService.findAll({ page, limit, search });
  }

  @Get(':id')
  @Roles('admin')
  findOne(@Param('id') id: number) {
    return this.userService.findOne(id);
  }

  @Post()
  @Roles('admin')
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: './uploads/avatars',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, uniqueSuffix + extname(file.originalname));
        },
      }),
    }),
  )
  create(
    @Body('status', ParseBoolPipe) status: boolean,
    @UploadedFile() avatar: Express.Multer.File,
    @Body() data: any,
  ) {
    data.status = status;
    return this.userService.create(data, avatar);
  }

  @Put(':id')
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: './uploads/avatars',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          callback(null, uniqueSuffix + extname(file.originalname));
        },
      }),
    }),
  )
  async update(
    @Body('status', ParseBoolPipe) status: boolean,
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateUserDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    data.status = status;
    return await this.userService.update(id, data, file);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.userService.remove(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id/status')
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: boolean,
  ) {
    if (typeof status !== 'boolean') {
      throw new BadRequestException('status must be a boolean');
    }
    return this.userService.updateStatus(id, status);
  }

  @Put(':id/role')
  @Roles('admin')
  changeRole(@Param('id') id: number, @Body() body: { role: string }) {
    return this.userService.changeRole(id, body.role);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getCurrentUser(@Req() req: any) {
    const authHeader = req.headers['authorization'];
    return this.userService.getCurrentUser(authHeader);
  }
}
