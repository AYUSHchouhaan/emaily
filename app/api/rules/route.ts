import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { rulesQueries, userQueries } from '@/db/query';

// GET - Fetch all rules for the authenticated user
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Use user ID from session instead of making a DB call
    const userId = (session.user as any).id;
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID not found in session' }, { status: 401 });
    }

    const rules = await rulesQueries.getRulesByUser(userId);
    
    return NextResponse.json({ rules });
  } catch (error) {
    console.error('Error fetching rules:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch rules' 
    }, { status: 500 });
  }
}

// POST - Create a new rule
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Use user ID from session instead of making a DB call
    const userId = (session.user as any).id;
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID not found in session' }, { status: 401 });
    }

    const body = await request.json();
    const { name, condition, label, priority } = body;

    if (!name || !condition || !label) {
      return NextResponse.json({ 
        error: 'Missing required fields: name, condition, label' 
      }, { status: 400 });
    }

    const rule = await rulesQueries.createRule({
      userId,
      name,
      condition,
      label,
      priority: priority || 0,
    });

    return NextResponse.json({ rule }, { status: 201 });
  } catch (error) {
    console.error('Error creating rule:', error);
    return NextResponse.json({ 
      error: 'Failed to create rule' 
    }, { status: 500 });
  }
}

// PUT - Update an existing rule
export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Use user ID from session instead of making a DB call
    const userId = (session.user as any).id;
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID not found in session' }, { status: 401 });
    }

    const body = await request.json();
    const { id, name, condition, label, priority, isActive } = body;

    if (!id) {
      return NextResponse.json({ 
        error: 'Missing rule ID' 
      }, { status: 400 });
    }

    // Verify rule belongs to user
    const existingRule = await rulesQueries.getRuleById(id);
    if (!existingRule || existingRule.userId !== userId) {
      return NextResponse.json({ 
        error: 'Rule not found or unauthorized' 
      }, { status: 404 });
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (condition !== undefined) updateData.condition = condition;
    if (label !== undefined) updateData.label = label;
    if (priority !== undefined) updateData.priority = priority;
    if (isActive !== undefined) updateData.isActive = isActive;

    const rule = await rulesQueries.updateRule(id, updateData);

    return NextResponse.json({ rule });
  } catch (error) {
    console.error('Error updating rule:', error);
    return NextResponse.json({ 
      error: 'Failed to update rule' 
    }, { status: 500 });
  }
}

// DELETE - Delete a rule
export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Use user ID from session instead of making a DB call
    const userId = (session.user as any).id;
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID not found in session' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ 
        error: 'Missing rule ID' 
      }, { status: 400 });
    }

    // Verify rule belongs to user
    const existingRule = await rulesQueries.getRuleById(id);
    if (!existingRule || existingRule.userId !== userId) {
      return NextResponse.json({ 
        error: 'Rule not found or unauthorized' 
      }, { status: 404 });
    }

    await rulesQueries.deleteRule(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting rule:', error);
    return NextResponse.json({ 
      error: 'Failed to delete rule' 
    }, { status: 500 });
  }
}
