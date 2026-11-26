import { Component } from 'react'

export default class AppErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  render() {
    if (!this.state.error) return this.props.children
    const offline = typeof navigator !== 'undefined' && !navigator.onLine

    return (
      <div className="view offline-view">
        <div className="offline-card">
          <div className="offline-icon" aria-hidden="true">{offline ? '📡' : '⚠️'}</div>
          <h1 className="view-title">
            {offline ? "You're offline" : 'Something went wrong'}
          </h1>
          <p className="view-sub">
            {offline
              ? 'This page could not be loaded without a connection.'
              : 'The page failed to load. Please try again.'}
          </p>
          <button
            type="button"
            className="btn btn-primary offline-retry"
            onClick={() => window.location.reload()}
          >
            {offline ? 'Retry connection' : 'Reload'}
          </button>
        </div>
      </div>
    )
  }
}