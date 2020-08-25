export interface ReserveInteractionRequest {
  type: 'block_actions';
  user: {
    username: string
  }
  actions: [
    {
      value: string
    }
  ]
}
