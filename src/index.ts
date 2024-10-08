import {
	CheckInRepository,
	CheckInService,
	CheckInsController,
	createCheckInsRouter,
} from '@/check-in';
import {
	MemberRepository,
	MemberService,
	MembersController,
	createMembersRouter,
} from '@/member';
import {
	MembershipPlanRepository,
	MembershipPlanService,
	MembershipPlansController,
	createMembershipPlansRouter,
} from '@/membership-plan';
import {
	PaymentRepository,
	PaymentService,
	PaymentsController,
	createPaymentsRouter,
} from '@/payment';
import { StripeService } from '@/stripe';
import { SupabaseService } from '@/supabase';
import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import type { NextFunction, Request, Response } from 'express';

const app = express();
const port = process.env.PORT || 4000;

// Set up middleware
app.use(bodyParser.json()); // Parses incoming requests with JSON payloads
app.use(bodyParser.urlencoded({ extended: true })); // Parses incoming requests with URL-encoded payloads
app.use(
	cors({
		origin: 'https://hc-gym-management.netlify.app',
	}),
);

// Set up dependencies
const supabaseService = new SupabaseService();

// Member
const memberRepository = new MemberRepository(supabaseService);
const memberService = new MemberService(memberRepository);
const membersController = new MembersController(memberService);
const memberRouter = createMembersRouter({
	membersController,
	memberRepository,
	memberService,
	supabaseService,
});

// Check-in
const checkInRepository = new CheckInRepository(supabaseService);
const checkInService = new CheckInService(checkInRepository, memberRepository);
const checkInsController = new CheckInsController(checkInService);
const checkInRouter = createCheckInsRouter({
	checkInsController,
	checkInRepository,
	checkInService,
	memberRepository,
	supabaseService,
});

// Membership Plan
const membershipPlansRepository = new MembershipPlanRepository(supabaseService);
const membershipPlansService = new MembershipPlanService(
	membershipPlansRepository,
);
const membershipPlansController = new MembershipPlansController(
	membershipPlansService,
);
const membershipPlanRouter = createMembershipPlansRouter({
	supabaseService,
	membershipPlansRepository,
	membershipPlansService,
	membershipPlansController,
});

// Payment
const paymentRepository = new PaymentRepository(supabaseService);
const stripeService = new StripeService();
const paymentService = new PaymentService(
	memberRepository,
	paymentRepository,
	membershipPlansRepository,
	stripeService,
);
const paymentsController = new PaymentsController(paymentService);
const paymentRouter = createPaymentsRouter({
	memberRepository,
	membershipPlansRepository,
	paymentRepository,
	paymentService,
	paymentsController,
	stripeService,
	supabaseService,
});

// Set up routes
const apiRouter = express.Router();
apiRouter.use('/check-ins', checkInRouter);
apiRouter.use('/members', memberRouter);
apiRouter.use('/membership-plans', membershipPlanRouter);
apiRouter.use('/payments', paymentRouter);
app.use('/api', apiRouter);

// Error handling middleware
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
	console.log('Error caught in global error handler');
	console.error(err.stack);
	res.status(500).json({
		status: 'error',
		message: 'Internal Server Error',
		...(process.env.NODE_ENV === 'development' && { error: err.message }),
	});
});

// Start the server
app.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});
