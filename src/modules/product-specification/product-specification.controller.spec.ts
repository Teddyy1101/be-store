import { Test, TestingModule } from '@nestjs/testing';
import { ProductSpecificationController } from './product-specification.controller';

describe('ProductSpecificationController', () => {
  let controller: ProductSpecificationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductSpecificationController],
    }).compile();

    controller = module.get<ProductSpecificationController>(ProductSpecificationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
