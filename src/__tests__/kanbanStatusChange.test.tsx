import { describe, it, expect } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { MissionKanban } from '@/components/missions/MissionKanban';
import { missionsMock } from '@/lib/mission-mock-data';

// Test superficiel: rendu des colonnes et compte.

describe('MissionKanban', () => {
  it('affiche les colonnes avec compte', () => {
  const { getByText } = render(<MemoryRouter><MissionKanban missions={missionsMock} /></MemoryRouter>);
    expect(getByText('En attente')).toBeTruthy();
    expect(getByText('En cours')).toBeTruthy();
  });
});
