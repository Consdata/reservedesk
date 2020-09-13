export interface ReserveInteractionRequest {
  type: string;
  user: {
    username: string;
  };
  callback_id: string;
  trigger_id: string;
  response_url: string;
  actions: [
    {
      selected_date: string;
      value: string;
      action_id: string;
    }
  ];
  view: {
    id: string;
    state: {
      values: {
        date: {
          date: {
            selected_date: string;
          }
        },
        room: {
          room: {
            value: string;
          }
        }
      }
    }
  }
}
