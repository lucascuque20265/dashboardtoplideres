import { Component, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="container py-12 text-center">
          <p className="text-red-500 mb-2">❌ Erro ao carregar página</p>
          <p className="text-xs text-muted-foreground mb-4">{this.state.error?.message}</p>
          <Link to="/candidates">
            <Button variant="link" className="mt-4">Voltar para lista</Button>
          </Link>
        </div>
      );
    }

    return this.props.children;
  }
}
