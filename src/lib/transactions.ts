import { db } from './db';

export const TRANSACTION_STATUSES = [
  'OFFER_ACCEPTED',
  'TRANSPORT_REQUESTED',
  'TRANSPORT_ACCEPTED',
  'IN_TRANSIT',
  'DELIVERED',
  'QUALITY_CONFIRMED',
  'PAYMENT_INITIATED',
  'PAYMENT_RECEIVED',
  'COMPLETED',
  'DISPUTED',
  'CANCELLED',
] as const;

export type TransactionStatus = typeof TRANSACTION_STATUSES[number];

export const PAYMENT_STATUSES = [
  'PENDING',
  'INITIATED',
  'PROCESSING',
  'PAID',
  'FAILED',
  'REFUNDED',
] as const;

export type PaymentStatus = typeof PAYMENT_STATUSES[number];

export const DISPUTE_REASONS = [
  // Core & Farmer-first (Preserved baseline)
  'PAYMENT_NOT_RECEIVED',
  'PAYMENT_INCORRECT',
  'WEIGHT_DISCREPANCY',
  'QUALITY_MISMATCH',
  'BUYER_ISSUE',
  'TRANSPORT_ISSUE',
  'PRODUCE_DAMAGED',
  'DELIVERY_ISSUE',
  'CONTRACT_ISSUE',
  'PAYMENT_DELAY',
  'DELIVERY_DELAY',
  'PRICE_DISAGREEMENT',
  'CANCELLATION',
  // Buyer-specific
  'CROP_VARIETY_MISMATCH',
  'QUANTITY_SHORTFALL',
  'MOISTURE_OR_FOREIGN_MATTER',
  'PRODUCE_NOT_AS_LISTED',
  'FARMER_FAILED_TO_DELIVER',
  'CONTRACT_OR_OFFER_ISSUE',
  'FARMER_CANCELLATION',
  // Transporter-specific
  'FARMER_NOT_READY',
  'PICKUP_LOCATION_ISSUE',
  'LOADING_ISSUE',
  'BUYER_DELIVERY_ISSUE',
  'DELIVERY_INSTRUCTION_CHANGED',
  'FREIGHT_PAYMENT_ISSUE',
  'CANCELLATION_AFTER_CONFIRMATION',
  'UNSAFE_OR_IMPOSSIBLE_PICKUP',
  // Cross-persona (Farmer/Buyer <-> Transporter)
  'TRANSPORTER_NO_SHOW',
  'PICKUP_DELAYED',
  'TRANSPORTER_CANCELLATION',
  'FREIGHT_DISCREPANCY',
  'PRODUCE_DAMAGED_IN_TRANSIT',
  'VEHICLE_CAPACITY_MISMATCH',
  'WRONG_DELIVERY_LOCATION',
  'TRANSPORTER_MISCONDUCT',
  'DELIVERY_HANDOVER_ISSUE',
  'OTHER',
] as const;

export type DisputeReason = typeof DISPUTE_REASONS[number];

export const BUYER_DISPUTE_REASONS: DisputeReason[] = [
  'CROP_VARIETY_MISMATCH',
  'QUALITY_MISMATCH',
  'QUANTITY_SHORTFALL',
  'MOISTURE_OR_FOREIGN_MATTER',
  'PRODUCE_NOT_AS_LISTED',
  'FARMER_FAILED_TO_DELIVER',
  'DELIVERY_DELAY',
  'CONTRACT_OR_OFFER_ISSUE',
  'FARMER_CANCELLATION',
  'PRODUCE_DAMAGED_IN_TRANSIT',
  'WRONG_DELIVERY_LOCATION',
  'OTHER',
];

export const TRANSPORTER_DISPUTE_REASONS: DisputeReason[] = [
  'FARMER_NOT_READY',
  'WEIGHT_DISCREPANCY',
  'PICKUP_LOCATION_ISSUE',
  'LOADING_ISSUE',
  'BUYER_DELIVERY_ISSUE',
  'DELIVERY_INSTRUCTION_CHANGED',
  'FREIGHT_PAYMENT_ISSUE',
  'CANCELLATION_AFTER_CONFIRMATION',
  'UNSAFE_OR_IMPOSSIBLE_PICKUP',
  'OTHER',
];

export const TRANSPORTER_COUNTERPARTY_REASONS: DisputeReason[] = [
  'TRANSPORTER_NO_SHOW',
  'PICKUP_DELAYED',
  'TRANSPORTER_CANCELLATION',
  'FREIGHT_DISCREPANCY',
  'PRODUCE_DAMAGED_IN_TRANSIT',
  'VEHICLE_CAPACITY_MISMATCH',
  'WRONG_DELIVERY_LOCATION',
  'TRANSPORTER_MISCONDUCT',
  'DELIVERY_HANDOVER_ISSUE',
  'OTHER',
];

export const DISPUTE_STATUSES = [
  'OPEN',
  'UNDER_REVIEW',
  'RESOLVED',
  'REJECTED',
  'CLOSED',
] as const;

export type DisputeStatus = typeof DISPUTE_STATUSES[number];

export const ROLE_PAIRS = [
  'FARMER_TO_BUYER',
  'BUYER_TO_FARMER',
  'FARMER_TO_TRANSPORTER',
  'BUYER_TO_TRANSPORTER',
] as const;

export type RolePair = typeof ROLE_PAIRS[number];

/**
 * Generates human-readable sequential code for a transaction.
 * e.g. TXN-2026-0001
 */
export async function generateTransactionCode(): Promise<string> {
  const currentYear = new Date().getFullYear();
  const count = await db.transaction.count();
  const sequence = String(count + 1).padStart(4, '0');
  const candidate = `TXN-${currentYear}-${sequence}`;

  // Ensure uniqueness
  const existing = await db.transaction.findUnique({ where: { transactionCode: candidate } });
  if (existing) {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    return `TXN-${currentYear}-${sequence}-${randomSuffix}`;
  }
  return candidate;
}

/**
 * Generates human-readable simulated reference for prototype payments.
 * e.g. DEMO-PAY-2026-0001
 */
export async function generatePaymentReference(): Promise<string> {
  const currentYear = new Date().getFullYear();
  const count = await db.payment.count();
  const sequence = String(count + 1).padStart(4, '0');
  return `DEMO-PAY-${currentYear}-${sequence}`;
}

/**
 * Generates human-readable code for a dispute/grievance.
 * e.g. DISP-2026-0001
 */
export async function generateDisputeCode(): Promise<string> {
  const currentYear = new Date().getFullYear();
  const count = await db.dispute.count();
  const sequence = String(count + 1).padStart(4, '0');
  const candidate = `DISP-${currentYear}-${sequence}`;

  const existing = await db.dispute.findUnique({ where: { disputeCode: candidate } });
  if (existing) {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    return `DISP-${currentYear}-${sequence}-${randomSuffix}`;
  }
  return candidate;
}

/**
 * Helper to dispatch in-app notifications
 */
export async function createNotification(data: {
  userId: string;
  title: string;
  message: string;
  type: string;
  linkUrl?: string;
}) {
  try {
    return await db.notification.create({
      data: {
        userId: data.userId,
        title: data.title,
        message: data.message,
        type: data.type,
        linkUrl: data.linkUrl || null,
      },
    });
  } catch (err) {
    console.error('Failed to create notification:', err);
    return null;
  }
}

/**
 * Creates or activates a Transaction from an accepted buyer Offer.
 * Enforces:
 * 1. Valid accepted offer.
 * 2. No duplicate transaction for the same offer/lot.
 * 3. Accurate contract gross value and Phase 6 Net Realisation deductions.
 * 4. Automatic initial Payment record creation (INITIATED).
 */
export async function createTransactionFromOffer(offerId: string) {
  const offer = await db.offer.findUnique({
    where: { id: offerId },
    include: {
      lot: {
        include: {
          farmer: { include: { user: true } },
          transportRequests: {
            where: { status: { in: ['ACCEPTED', 'IN_TRANSIT', 'DELIVERED'] } },
            orderBy: { createdAt: 'desc' },
          },
        },
      },
      buyer: { include: { user: true } },
    },
  });

  if (!offer) {
    throw new Error(`Offer ${offerId} not found.`);
  }

  // Check if an existing transaction is already tied to this lot
  const existingTxn = await db.transaction.findFirst({
    where: {
      lotId: offer.lotId,
      buyerId: offer.buyerId,
    },
    include: {
      payments: true,
      ratings: true,
      disputes: true,
    },
  });

  if (existingTxn) {
    return existingTxn;
  }

  const transactionCode = await generateTransactionCode();
  const paymentRef = await generatePaymentReference();

  const qty = offer.quantityQuintals;
  const agreedPrice = offer.offeredPricePerQtl;
  const grossSaleValue = Math.round(qty * agreedPrice);

  // Link transport request if one was already booked/accepted
  const activeTransport = offer.lot.transportRequests[0];
  const transportCost = activeTransport ? activeTransport.estimatedCost : 0.0;
  const transporterId = activeTransport?.transporterId || null;

  // Phase 6 economic deductions: Direct buyer saves APMC cess (₹0), handling is ₹15/Qtl
  const otherCosts = Math.round(qty * 15);
  const storageCost = 0.0;
  const netRealisation = Math.round(grossSaleValue - transportCost - storageCost - otherCosts);

  // Atomic database transaction
  const [createdTxn] = await db.$transaction([
    db.transaction.create({
      data: {
        transactionCode,
        lotId: offer.lotId,
        farmerId: offer.lot.farmerId,
        buyerId: offer.buyerId,
        transporterId,
        agreedPricePerQuintal: agreedPrice,
        quantityQuintals: qty,
        grossSaleValue,
        transportCost,
        storageCost,
        otherCosts,
        netRealisation,
        status: 'OFFER_ACCEPTED',
        payments: {
          create: {
            amount: grossSaleValue,
            paymentMethod: offer.paymentTerms || 'ESCROW_GATEWAY',
            paymentStatus: 'INITIATED',
            escrowReference: paymentRef,
          },
        },
      },
      include: {
        lot: true,
        farmer: { include: { user: true } },
        buyer: { include: { user: true } },
        transporter: { include: { user: true } },
        payments: true,
      },
    }),
    // Ensure offer status is ACCEPTED
    db.offer.update({
      where: { id: offerId },
      data: { status: 'ACCEPTED' },
    }),
    // Ensure lot status is RESERVED
    db.produceLot.update({
      where: { id: offer.lotId },
      data: { status: 'RESERVED' },
    }),
  ]);

  // Dispatch notifications
  if (offer.lot.farmer?.user) {
    await createNotification({
      userId: offer.lot.farmer.user.id,
      title: 'Transaction Created',
      message: `Commercial contract ${transactionCode} activated for ${offer.lot.commodity} (${qty} Qtl @ ₹${agreedPrice}/Qtl).`,
      type: 'TRANSACTION',
      linkUrl: `/transactions/${createdTxn.id}`,
    });
  }

  if (offer.buyer?.user) {
    await createNotification({
      userId: offer.buyer.user.id,
      title: 'Purchase Agreement Activated',
      message: `Purchase contract ${transactionCode} confirmed with ${offer.lot.farmer.user?.fullName || 'Farmer'} for ₹${grossSaleValue.toLocaleString('en-IN')}.`,
      type: 'TRANSACTION',
      linkUrl: `/transactions/${createdTxn.id}`,
    });
  }

  return createdTxn;
}

/**
 * Validates status transition legality
 */
export function isValidTransition(current: string, next: string): boolean {
  if (current === next) return true;
  if (next === 'DISPUTED') return true; // Can enter dispute from any active state
  if (current === 'DISPUTED') return true; // Can resume or close after resolution
  if (next === 'CANCELLED' && ['OFFER_ACCEPTED', 'TRANSPORT_REQUESTED'].includes(current)) return true;

  const validTransitions: Record<string, string[]> = {
    OFFER_ACCEPTED: ['TRANSPORT_REQUESTED', 'TRANSPORT_ACCEPTED', 'IN_TRANSIT', 'CANCELLED'],
    TRANSPORT_REQUESTED: ['TRANSPORT_ACCEPTED', 'CANCELLED'],
    TRANSPORT_ACCEPTED: ['IN_TRANSIT'],
    IN_TRANSIT: ['DELIVERED'],
    DELIVERED: ['QUALITY_CONFIRMED', 'PAYMENT_INITIATED'],
    QUALITY_CONFIRMED: ['PAYMENT_INITIATED', 'PAYMENT_RECEIVED'],
    PAYMENT_INITIATED: ['PAYMENT_RECEIVED', 'COMPLETED'],
    PAYMENT_RECEIVED: ['COMPLETED'],
    COMPLETED: [],
    CANCELLED: [],
  };

  return (validTransitions[current] || []).includes(next);
}

/**
 * Updates a Transaction status with role-based checks.
 */
export async function updateTransactionStatus(
  transactionId: string,
  targetStatus: TransactionStatus,
  caller: { role: string; userId?: string; profileId?: string }
) {
  const txn = await db.transaction.findUnique({
    where: { id: transactionId },
    include: {
      lot: true,
      farmer: { include: { user: true } },
      buyer: { include: { user: true } },
      transporter: { include: { user: true } },
      payments: true,
    },
  });

  if (!txn) {
    throw new Error(`Transaction ${transactionId} not found.`);
  }

  // Authorization check
  const isFarmer =
    caller.role === 'FARMER' &&
    (caller.userId === txn.farmer.userId || caller.profileId === txn.farmerId);
  const isBuyer =
    caller.role === 'BUYER' &&
    (caller.userId === txn.buyer.userId || caller.profileId === txn.buyerId);
  const isTransporter =
    caller.role === 'TRANSPORTER' &&
    (caller.userId === txn.transporter?.userId || caller.profileId === txn.transporterId);
  const isAdmin = caller.role === 'ADMIN';

  if (!isFarmer && !isBuyer && !isTransporter && !isAdmin) {
    throw new Error('Unauthorized: You do not have permission to modify this transaction.');
  }

  if (!isValidTransition(txn.status, targetStatus) && !isAdmin) {
    throw new Error(
      `Invalid transaction transition from ${txn.status} to ${targetStatus}.`
    );
  }

  const updateData: Record<string, unknown> = {
    status: targetStatus,
  };

  // If status moved to PAYMENT_RECEIVED or COMPLETED, ensure payment record is marked PAID
  const paymentUpdates = [];
  if (targetStatus === 'PAYMENT_RECEIVED' || targetStatus === 'COMPLETED') {
    for (const p of txn.payments) {
      if (p.paymentStatus !== 'PAID') {
        paymentUpdates.push(
          db.payment.update({
            where: { id: p.id },
            data: {
              paymentStatus: 'PAID',
              payoutDate: p.payoutDate || new Date(),
            },
          })
        );
      }
    }
  }

  // If status is COMPLETED, also update produceLot to SOLD
  if (targetStatus === 'COMPLETED') {
    paymentUpdates.push(
      db.produceLot.update({
        where: { id: txn.lotId },
        data: { status: 'SOLD' },
      })
    );
  } else if (targetStatus === 'CANCELLED') {
    paymentUpdates.push(
      db.produceLot.update({
        where: { id: txn.lotId },
        data: { status: 'AVAILABLE' },
      })
    );
  }

  const [updatedTxn] = await db.$transaction([
    db.transaction.update({
      where: { id: transactionId },
      data: updateData,
      include: {
        lot: true,
        farmer: { include: { user: true } },
        buyer: { include: { user: true } },
        transporter: { include: { user: true } },
        payments: true,
        ratings: true,
        disputes: true,
      },
    }),
    ...paymentUpdates,
  ]);

  return updatedTxn;
}

/**
 * Updates payment tracking status (e.g. INITIATED -> PROCESSING -> PAID).
 * Does NOT move real funds; tracks simulated prototype milestones.
 */
export async function updatePaymentStatus(
  paymentId: string,
  targetPaymentStatus: PaymentStatus,
  caller: { role: string; userId?: string }
) {
  const payment = await db.payment.findUnique({
    where: { id: paymentId },
    include: {
      transaction: {
        include: {
          farmer: { include: { user: true } },
          buyer: { include: { user: true } },
        },
      },
    },
  });

  if (!payment) {
    throw new Error(`Payment ${paymentId} not found.`);
  }

  const isFarmer = caller.role === 'FARMER' && caller.userId === payment.transaction.farmer.userId;
  const isBuyer = caller.role === 'BUYER' && caller.userId === payment.transaction.buyer.userId;
  const isAdmin = caller.role === 'ADMIN';

  if (!isFarmer && !isBuyer && !isAdmin) {
    throw new Error('Unauthorized to update payment status for this transaction.');
  }

  const updatedPayment = await db.payment.update({
    where: { id: paymentId },
    data: {
      paymentStatus: targetPaymentStatus,
      payoutDate: targetPaymentStatus === 'PAID' ? new Date() : payment.payoutDate,
    },
  });

  // If payment became PAID, progress the transaction status to PAYMENT_RECEIVED
  if (targetPaymentStatus === 'PAID' && payment.transaction.status !== 'COMPLETED') {
    await db.transaction.update({
      where: { id: payment.transactionId },
      data: { status: 'PAYMENT_RECEIVED' },
    });
  }

  return updatedPayment;
}

/**
 * Submits a transaction-linked 3-way rating.
 * Supported role pairs:
 * - FARMER_TO_BUYER
 * - BUYER_TO_FARMER
 * - FARMER_TO_TRANSPORTER
 * - BUYER_TO_TRANSPORTER
 */
export async function submitTransactionRating(params: {
  transactionId: string;
  raterId: string;
  rateeId: string;
  rolePair: RolePair;
  ratingScore: number;
  feedback?: string;
}) {
  const { transactionId, raterId, rateeId, rolePair, ratingScore, feedback } = params;

  if (ratingScore < 1 || ratingScore > 5) {
    throw new Error('Rating score must be between 1 and 5 stars.');
  }

  const txn = await db.transaction.findUnique({
    where: { id: transactionId },
    include: {
      farmer: { include: { user: true } },
      buyer: { include: { user: true } },
      transporter: { include: { user: true } },
      ratings: true,
    },
  });

  if (!txn) {
    throw new Error(`Transaction ${transactionId} not found.`);
  }

  // Check that transaction is in an eligible post-delivery or completion state
  const eligibleStatuses = [
    'DELIVERED',
    'QUALITY_CONFIRMED',
    'PAYMENT_INITIATED',
    'PAYMENT_RECEIVED',
    'COMPLETED',
  ];
  if (!eligibleStatuses.includes(txn.status)) {
    throw new Error(
      `Ratings become available only after produce delivery (current status: ${txn.status}).`
    );
  }

  // Validate rater and ratee match the role pair
  if (rolePair === 'FARMER_TO_BUYER') {
    if (raterId !== txn.farmer.userId || rateeId !== txn.buyer.userId) {
      throw new Error('Invalid parties for FARMER_TO_BUYER rating.');
    }
  } else if (rolePair === 'BUYER_TO_FARMER') {
    if (raterId !== txn.buyer.userId || rateeId !== txn.farmer.userId) {
      throw new Error('Invalid parties for BUYER_TO_FARMER rating.');
    }
  } else if (rolePair === 'FARMER_TO_TRANSPORTER') {
    if (!txn.transporter?.userId) {
      throw new Error('No transporter assigned to this transaction.');
    }
    if (raterId !== txn.farmer.userId || rateeId !== txn.transporter.userId) {
      throw new Error('Invalid parties for FARMER_TO_TRANSPORTER rating.');
    }
  } else if (rolePair === 'BUYER_TO_TRANSPORTER') {
    if (!txn.transporter?.userId) {
      throw new Error('No transporter assigned to this transaction.');
    }
    if (raterId !== txn.buyer.userId || rateeId !== txn.transporter.userId) {
      throw new Error('Invalid parties for BUYER_TO_TRANSPORTER rating.');
    }
  } else {
    throw new Error(`Unsupported role pair: ${rolePair}`);
  }

  // Check for duplicate rating by the same rater for this transaction & rolePair
  const existingRating = await db.rating.findFirst({
    where: {
      transactionId,
      raterId,
      rolePair,
    },
  });

  if (existingRating) {
    throw new Error('You have already submitted a rating for this transaction.');
  }

  const rating = await db.rating.create({
    data: {
      transactionId,
      raterId,
      rateeId,
      rolePair,
      ratingScore: Math.round(ratingScore),
      feedback: feedback ? feedback.trim() : null,
    },
  });

  return rating;
}

/**
 * Raises a digital evidence-based grievance/dispute for a transaction.
 */
export async function raiseTransactionDispute(params: {
  transactionId: string;
  raisedById?: string;
  role?: 'FARMER' | 'BUYER' | 'TRANSPORTER';
  reason: DisputeReason;
  evidenceSummary: string;
  evidenceFilesJson?: string;
}) {
  const { transactionId, reason, evidenceSummary, evidenceFilesJson, role } = params;

  if (!evidenceSummary || evidenceSummary.trim().length < 5) {
    throw new Error('Evidence summary must detail the discrepancy (minimum 5 characters).');
  }

  const txn = await db.transaction.findUnique({
    where: { id: transactionId },
    include: {
      farmer: { include: { user: true } },
      buyer: { include: { user: true } },
      transporter: { include: { user: true } },
    },
  });

  if (!txn) {
    throw new Error(`Transaction ${transactionId} not found.`);
  }

  let effectiveRaisedById = params.raisedById;
  if (!effectiveRaisedById) {
    if (role === 'BUYER') {
      effectiveRaisedById = txn.buyer.userId;
    } else if (role === 'TRANSPORTER' && txn.transporter?.userId) {
      effectiveRaisedById = txn.transporter.userId;
    } else {
      effectiveRaisedById = txn.farmer.userId;
    }
  }

  // Verify caller is part of this transaction
  const allowedUserIds = [
    txn.farmer.userId,
    txn.buyer.userId,
    txn.transporter?.userId,
  ].filter(Boolean);

  if (!allowedUserIds.includes(effectiveRaisedById)) {
    throw new Error('Unauthorized: Only transaction parties can raise a grievance.');
  }

  const disputeCode = await generateDisputeCode();

  const [dispute] = await db.$transaction([
    db.dispute.create({
      data: {
        disputeCode,
        transactionId,
        raisedById: effectiveRaisedById,
        reason,
        evidenceSummary: evidenceSummary.trim(),
        evidenceFilesJson: evidenceFilesJson || null,
        status: 'OPEN',
      },
    }),
    db.transaction.update({
      where: { id: transactionId },
      data: { status: 'DISPUTED' },
    }),
  ]);

  return dispute;
}

/**
 * Adjudicates or updates a grievance by an authorized administrator/FPO officer.
 * IMPORTANT: AI never decides disputes. Human oversight recorded here.
 */
export async function resolveTransactionDispute(params: {
  disputeId: string;
  targetStatus: DisputeStatus;
  resolutionNotes: string;
  adminUserId?: string;
}) {
  const { disputeId, targetStatus, resolutionNotes } = params;

  if (!resolutionNotes || resolutionNotes.trim().length < 10) {
    throw new Error('A detailed resolution/reason note (minimum 10 characters) is required to record adjudication.');
  }

  const dispute = await db.dispute.findUnique({
    where: { id: disputeId },
    include: { transaction: true },
  });

  if (!dispute) {
    throw new Error(`Dispute ${disputeId} not found.`);
  }

  const updateData: Record<string, unknown> = {
    status: targetStatus,
    resolutionNotes: resolutionNotes.trim(),
  };

  if (targetStatus === 'RESOLVED' || targetStatus === 'CLOSED' || targetStatus === 'REJECTED') {
    updateData.resolvedAt = new Date();
  }

  const updatedDispute = await db.dispute.update({
    where: { id: disputeId },
    data: updateData,
  });

  // If dispute is resolved or closed, restore transaction status appropriately
  if (targetStatus === 'RESOLVED') {
    await db.transaction.update({
      where: { id: dispute.transactionId },
      data: { status: 'COMPLETED' },
    });
  } else if (targetStatus === 'CLOSED' || targetStatus === 'REJECTED') {
    // Return to completed
    await db.transaction.update({
      where: { id: dispute.transactionId },
      data: { status: 'COMPLETED' },
    });
  }

  return updatedDispute;
}
