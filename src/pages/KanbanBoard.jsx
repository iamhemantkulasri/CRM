import React, { useState, useRef } from 'react';
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragOverlay
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { KanbanColumn } from '../components/KanbanColumn';
import { LeadCard } from '../components/LeadCard';
import { STAGES } from '../utils/constants';
import { useLeadStore } from '../store/leadStore';
import { useAuthStore } from '../store/authStore';
import { useActivityStore } from '../store/activityStore';
import { useDealStore } from '../store/dealStore';

export function KanbanBoard({ leads, onLeadClick, onEditLead, onDeleteLead }) {
  const { updateLeadStage, updateLead } = useLeadStore();
  const { currentUser } = useAuthStore();
  const { logActivity } = useActivityStore();
  const [activeLead, setActiveLead] = useState(null);
  const isDraggingRef = useRef(false);

  // Configure separate Mouse and Touch sensors:
  // - Mouse: 8px drag movement required before drag starts, preserving instant click
  // - Touch: 200ms hold required before drag starts, preserving smooth mobile vertical scroll
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event) => {
    isDraggingRef.current = true;
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(40);
      } catch (_) {}
    }
    const { active } = event;
    const draggedLead = leads.find(l => l.id === active.id);
    setActiveLead(draggedLead);
  };

  const handleDragCancel = () => {
    setActiveLead(null);
    setTimeout(() => {
      isDraggingRef.current = false;
    }, 150);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveLead(null);
    setTimeout(() => {
      isDraggingRef.current = false;
    }, 150);
    
    if (!over) return;

    const leadId = active.id;
    const activeLeadData = leads.find(l => l.id === leadId);
    if (!activeLeadData) return;

    const oldStage = activeLeadData.stage;
    
    // Find what stage the lead was dropped into
    // It could be dropped on another card (over.id is a leadId) or an empty column (over.id is a stageId)
    let newStage = over.id;
    const overLead = leads.find(l => l.id === over.id);
    if (overLead) {
      newStage = overLead.stage;
    }

    if (oldStage !== newStage && STAGES.some(s => s.id === newStage)) {
      updateLeadStage(leadId, newStage);
      const stageObj = STAGES.find(s => s.id === newStage);
      logActivity(
        leadId,
        'STAGE_CHANGED',
        `Moved to ${stageObj?.label || newStage}`,
        currentUser?.id || 'system'
      );

      // Auto-log deal when lead is won
      if (newStage === 'won') {
        const existingDeals = useDealStore.getState().deals;
        const alreadyLogged = existingDeals.some(d => d.leadId === leadId);
        if (!alreadyLogged) {
          const budgetVal = activeLeadData.requirements?.budgetMaxLakhs || activeLeadData.requirements?.budgetMinLakhs || 100;
          useDealStore.getState().addDeal({
            leadId,
            agentId: activeLeadData.assignedTo || currentUser?.id || 'emp_admin',
            totalDealValueLakhs: budgetVal,
            brokeragePercentage: 2,
            status: 'pending_invoice'
          });
          logActivity(
            leadId,
            'DEAL_CREATED',
            `Closed deal logged for ₹${budgetVal} Lakhs`,
            currentUser?.id || 'system'
          );
        }
      }
    }
  };

  const handleLeadClick = (lead) => {
    if (isDraggingRef.current) return;
    if (onLeadClick) onLeadClick(lead);
  };

  return (
    <div className="kanban-board custom-scrollbar">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        {STAGES.map((stage) => (
          <KanbanColumn 
            key={stage.id} 
            stageId={stage.id} 
            leads={leads.filter(l => l.stage === stage.id)}
            onLeadClick={handleLeadClick}
            onEditLead={onEditLead}
            onDeleteLead={onDeleteLead}
          />
        ))}
        
        <DragOverlay dropAnimation={{
          duration: 180,
          easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
        }}>
          {activeLead ? <LeadCard lead={activeLead} isOverlay={true} /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
