import App from './App'

import { render, screen } from '@testing-library/react'

it('renders without crashing', () => {
  render(<App />)

  expect(screen.getByText(/Battle Math/)).toBeInTheDocument()
})
