import { Test, TestingModule } from '@nestjs/testing';
import { ProductOptionController } from './product-option.controller';

describe('ProductOptionController', () => {
  let controller: ProductOptionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductOptionController],
    }).compile();

    controller = module.get<ProductOptionController>(ProductOptionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
