import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

interface Deal {
  id: number;
  organization_name: string | null;
  name: string;
  stage: string;
  value: number;
}

const STAGES = ['New', 'Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost'];

const Pipeline: React.FC = () => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const navigate = useNavigate();

  const fetchDeals = async () => {
    const res = await fetch('/api/deals');
    setDeals(await res.json());
  };

  useEffect(() => {
    fetchDeals();
  }, []);

  const onDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;
    if (source.droppableId === destination.droppableId) return;

    const dealId = Number(draggableId);
    const newStage = destination.droppableId;

    // Optimistically update UI
    setDeals(prevDeals => prevDeals.map(d => d.id === dealId ? { ...d, stage: newStage } : d));

    // Persist
    const dealToUpdate = deals.find(d => d.id === dealId);
    if (!dealToUpdate) return;
    
    await fetch(`/api/deals/${dealId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...dealToUpdate, stage: newStage })
    });
  };

  const getDealsByStage = (stage: string) => deals.filter(d => d.stage === stage);

  return (
    <div style={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
      <div className="page-header">
        <h1 className="page-title">Pipeline</h1>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="pipeline-board">
          {STAGES.map(stage => {
            const stageDeals = getDealsByStage(stage);
            const totalValue = stageDeals.reduce((sum, d) => sum + d.value, 0);

            return (
              <div key={stage} className="pipeline-column">
                <div className="pipeline-column-header">
                  <h3 className="pipeline-column-title">{stage}</h3>
                  <div className="pipeline-column-meta">
                    <span>{stageDeals.length} deals</span>
                    <span>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(totalValue)}</span>
                  </div>
                </div>

                <Droppable droppableId={stage}>
                  {(provided, snapshot) => (
                    <div 
                      className={`pipeline-droppable ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                    >
                      {stageDeals.map((deal, index) => (
                        <Draggable key={deal.id} draggableId={String(deal.id)} index={index}>
                          {(provided, snapshot) => (
                            <div
                              className={`pipeline-card ${snapshot.isDragging ? 'is-dragging' : ''}`}
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              onClick={() => navigate(`/deals/${deal.id}`)}
                            >
                              <div className="pipeline-card-title">{deal.name}</div>
                              <div className="pipeline-card-org">{deal.organization_name || 'No Organization'}</div>
                              <div className="pipeline-card-value">
                                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(deal.value)}
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
};

export default Pipeline;
