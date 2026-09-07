import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    application: 'KisanSetu',
    version: '0.1.0-phase1',
    sihProblemStatement: '26132',
    problemTitle: 'Strengthening market linkages and price discovery for farmers',
    problemOwner: 'Government of Maharashtra',
    timestamp: new Date().toISOString(),
    supportedLocales: ['en', 'mr', 'te', 'hi'],
    database: 'Prisma SQLite (PostgreSQL Ready)',
    phase: 'Phase 1: Architecture & Foundation Complete',
  });
}
