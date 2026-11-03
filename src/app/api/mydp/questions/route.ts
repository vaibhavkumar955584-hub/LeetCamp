import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { ensureCustomDpTables, getCustomDpProblems, getSharedCustomDpProblems } from '@/lib/customDpDb';

export async function GET(req: NextRequest) {
  try {
    const sessionId = req.cookies.get('guest_session')?.value;
    const user = getSessionUser(sessionId);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const db = getDatabase();
    ensureCustomDpTables(db);

    const url = new URL(req.url);
    const shared = url.searchParams.get('shared') === 'true';

    let problems;
    if (shared) {
      problems = getSharedCustomDpProblems(user.id);
    } else {
      problems = getCustomDpProblems(user.id);
      if (problems.length === 0) {
        problems = getSharedCustomDpProblems(user.id);
      }
    }

    const normalized = problems.map(p => ({
      id: p.id,
      title: p.title,
      url: p.url,
      addedAt: p.created_at,
      notes: p.notes || undefined,
      difficulty: p.difficulty as 'Easy' | 'Medium' | 'Hard' | undefined,
      tags: p.tags ? JSON.parse(p.tags) : undefined,
      solvedOn: p.solved_on || undefined,
      revision: p.revision === 1,
      isPublic: p.is_public === 1,
      createdAt: p.created_at,
      updatedAt: p.updated_at,
    }));

    return NextResponse.json({ questions: normalized, count: normalized.length });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const sessionId = req.cookies.get('guest_session')?.value;
    const user = getSessionUser(sessionId);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { title, url, notes, difficulty, tags, solvedOn, revision, isPublic } = body;

    if (!title || !url) {
      return NextResponse.json({ error: 'Title and URL are required' }, { status: 400 });
    }

    const { createCustomDpProblem } = await import('@/lib/customDpDb');
    const problem = createCustomDpProblem(user.id, { title, url, notes, difficulty, tags, solvedOn, revision, isPublic });

    return NextResponse.json({
      id: problem.id,
      title: problem.title,
      url: problem.url,
      addedAt: problem.created_at,
      notes: problem.notes || undefined,
      difficulty: problem.difficulty as 'Easy' | 'Medium' | 'Hard' | undefined,
      tags: problem.tags ? JSON.parse(problem.tags) : undefined,
      solvedOn: problem.solved_on || undefined,
      revision: problem.revision === 1,
      isPublic: problem.is_public === 1,
    }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const sessionId = req.cookies.get('guest_session')?.value;
    const user = getSessionUser(sessionId);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { id, title, url, notes, difficulty, tags, solvedOn, revision, isPublic } = body;

    if (!id) {
      return NextResponse.json({ error: 'Problem ID is required' }, { status: 400 });
    }

    const { updateCustomDpProblem } = await import('@/lib/customDpDb');
    const problem = updateCustomDpProblem(id, user.id, { title, url, notes, difficulty, tags, solvedOn, revision, isPublic });

    if (!problem) {
      return NextResponse.json({ error: 'Problem not found or not authorized' }, { status: 404 });
    }

    return NextResponse.json({
      id: problem.id,
      title: problem.title,
      url: problem.url,
      addedAt: problem.created_at,
      notes: problem.notes || undefined,
      difficulty: problem.difficulty as 'Easy' | 'Medium' | 'Hard' | undefined,
      tags: problem.tags ? JSON.parse(problem.tags) : undefined,
      solvedOn: problem.solved_on || undefined,
      revision: problem.revision === 1,
      isPublic: problem.is_public === 1,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const sessionId = req.cookies.get('guest_session')?.value;
    const user = getSessionUser(sessionId);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const url = new URL(req.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Problem ID is required' }, { status: 400 });
    }

    const { deleteCustomDpProblem } = await import('@/lib/customDpDb');
    const deleted = deleteCustomDpProblem(id, user.id);

    if (!deleted) {
      return NextResponse.json({ error: 'Problem not found or not authorized' }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}