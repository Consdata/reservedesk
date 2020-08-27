export interface ReserveInteractionRequest {
  type: 'block_actions';
  user: {
    username: string;
  };
  response_url: string;
  actions: [
    {
      value: string;
    }
  ];
}
