export interface ReserveInteractionRequest {
  type: 'block_actions';
  user: {
    username: string;
  };
  trigger_id: string;
  view: {
    id: string;
  }
  response_url: string;
  actions: [
    {
      value: string;
    }
  ];
}
