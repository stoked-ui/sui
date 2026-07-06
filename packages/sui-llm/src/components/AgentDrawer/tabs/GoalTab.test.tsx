import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import GoalTab from './GoalTab';
import type { GoalItem } from '../../../types';

const goals: GoalItem[] = [
  { id: 'g1', title: 'Goal 1', status: 'Done', progress: 100, logs: ['log1'], mtime: 'now' },
  { id: 'g2', title: 'Goal 2', status: 'Running', progress: 50, logs: ['log2'], mtime: 'now' },
];

describe('GoalTab', () => {
  test('renders goals list', () => {
    const onNewGoalTitleChange = jest.fn();

    render(
      <GoalTab
        goals={goals}
        newGoalTitle=""
        onNewGoalTitleChange={onNewGoalTitleChange}
      />
    );

    expect(screen.getByTestId('goal-tab')).toBeInTheDocument();
    expect(screen.getByTestId('goal-item-g1')).toBeInTheDocument();
    expect(screen.getByTestId('goal-item-g2')).toBeInTheDocument();
  });

  test('add button disabled when title empty', () => {
    const onNewGoalTitleChange = jest.fn();

    render(
      <GoalTab
        goals={goals}
        newGoalTitle=""
        onNewGoalTitleChange={onNewGoalTitleChange}
      />
    );

    const addButton = screen.getByTestId('goal-add-button');
    expect(addButton).toBeDisabled();
  });

  test('input change calls onNewGoalTitleChange and add button works', () => {
    const onNewGoalTitleChange = jest.fn();
    const onAddGoal = jest.fn();

    const { rerender } = render(
      <GoalTab
        goals={goals}
        newGoalTitle=""
        onNewGoalTitleChange={onNewGoalTitleChange}
        onAddGoal={onAddGoal}
      />
    );

    // Find input by placeholder
    const titleInput = screen.getByPlaceholderText('e.g. Scrape new tech postings...');
    fireEvent.change(titleInput, { target: { value: 'New goal' } });
    expect(onNewGoalTitleChange).toHaveBeenCalledWith('New goal');

    // Re-render with non-empty title
    rerender(
      <GoalTab
        goals={goals}
        newGoalTitle="New goal"
        onNewGoalTitleChange={onNewGoalTitleChange}
        onAddGoal={onAddGoal}
      />
    );

    const addButton = screen.getByTestId('goal-add-button');
    fireEvent.click(addButton);
    expect(onAddGoal).toHaveBeenCalled();
  });
});