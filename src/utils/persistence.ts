import { useStore } from '../store/rootStore';

export const saveState = () => {
  const state = useStore.getState();
  localStorage.setItem('wings-ocean-state', JSON.stringify({
    events: state.events,
    participants: state.participants,
    volunteers: state.volunteers,
  }));
};

export const loadState = () => {
  const savedState = localStorage.getItem('wings-ocean-state');
  if (savedState) {
    const state = JSON.parse(savedState);
    useStore.setState(state);
  }
};

// Auto-save state changes
useStore.subscribe(saveState);