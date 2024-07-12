import React from 'react';
import { ScoutBar } from 'scoutbar';

export default function App() {
  return (
    <div className="App">
      <ScoutBar
        actions={({ createScoutAction }) => [
          createScoutAction({
            label: 'Get Started',
            description: 'Get started with scoutbar',
            href: '/',
          }),
        ]}
      />
    </div>
  );
}