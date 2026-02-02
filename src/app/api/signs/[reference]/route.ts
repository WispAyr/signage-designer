import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const SIGNS_DIR = path.join(process.cwd(), 'signs');

// Load sign by reference
async function loadSign(reference: string) {
  try {
    const signPath = path.join(SIGNS_DIR, `${reference}.json`);
    const data = await fs.readFile(signPath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return null;
  }
}

// GET /api/signs/[reference] - Get sign by reference
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ reference: string }> }
) {
  const { reference } = await params;
  const sign = await loadSign(reference);

  if (!sign) {
    return NextResponse.json(
      { error: 'Sign not found' },
      { status: 404 }
    );
  }

  return NextResponse.json(sign);
}

// DELETE /api/signs/[reference] - Delete sign
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ reference: string }> }
) {
  const { reference } = await params;
  
  try {
    // Load index
    const indexPath = path.join(SIGNS_DIR, 'index.json');
    const indexData = await fs.readFile(indexPath, 'utf-8');
    let signs = JSON.parse(indexData);
    
    // Remove from index
    signs = signs.filter((s: any) => s.reference !== reference);
    await fs.writeFile(indexPath, JSON.stringify(signs, null, 2));
    
    // Delete file
    const signPath = path.join(SIGNS_DIR, `${reference}.json`);
    await fs.unlink(signPath).catch(() => {});
    
    return NextResponse.json({ message: 'Sign deleted' });
  } catch {
    return NextResponse.json(
      { error: 'Failed to delete sign' },
      { status: 500 }
    );
  }
}
