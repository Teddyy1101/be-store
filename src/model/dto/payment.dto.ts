// src/payment/dto/create-payment.dto.ts
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { PaymentGateway } from '../entities/payment.entities';

export class CreatePaymentDto {
  @IsNumber()
  orderId: number;

  @IsEnum(PaymentGateway)
  paymentGateway: PaymentGateway;

  @IsNumber()
  amount: number;

  @IsOptional()
  @IsString()
  returnUrl?: string; // Cho VNPAY callback
}

// src/payment/dto/create-vietqr-payment.dto.ts
export class CreateVietQRPaymentDto {
  @IsNumber()
  orderId: number;

  @IsNumber()
  amount: number;

  @IsOptional()
  @IsString()
  description?: string;
}

// src/payment/dto/create-vnpay-payment.dto.ts
export class CreateVNPayPaymentDto {
  @IsNumber()
  orderId: number;

  @IsNumber()
  amount: number;

  @IsString()
  returnUrl: string;

  @IsOptional()
  @IsString()
  orderInfo?: string;
}

// src/payment/dto/vnpay-callback.dto.ts
export class VNPayCallbackDto {
  vnp_Amount: string;
  vnp_BankCode: string;
  vnp_BankTranNo: string;
  vnp_CardType: string;
  vnp_OrderInfo: string;
  vnp_PayDate: string;
  vnp_ResponseCode: string;
  vnp_TmnCode: string;
  vnp_TransactionNo: string;
  vnp_TransactionStatus: string;
  vnp_TxnRef: string;
  vnp_SecureHash?: string;
}

// src/payment/dto/check-payment.dto.ts
export class CheckPaymentDto {
  @IsNumber()
  orderId: number;

  @IsString()
  transactionCode: string;
}

// src/payment/dto/payment-response.dto.ts
export class PaymentResponseDto {
  paymentId: number;
  orderId: number;
  paymentGateway: string;
  amount: number;
  status: string;
  transactionCode?: string;
  qrCode?: string;
  paymentUrl?: string;
  createdAt: Date;
}

// src/payment/dto/sepay-webhook.dto.ts
export class SepayWebhookDto {
  id: number;
  gateway: string;
  transactionDate: string;
  accountNumber: string;
  content: string; // 👈 chứa ORDxxxx
  transferAmount: number; // 👈 số tiền vào
  referenceCode: string; // 👈 mã giao dịch ngân hàng (KHÔNG dùng match)
  description?: string;
}
