import { Test, TestingModule } from '@nestjs/testing';
import { ProductSpecificationService } from './product-specification.service';

describe('ProductSpecificationService', () => {
  let service: ProductSpecificationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProductSpecificationService],
    }).compile();

    service = module.get<ProductSpecificationService>(ProductSpecificationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
