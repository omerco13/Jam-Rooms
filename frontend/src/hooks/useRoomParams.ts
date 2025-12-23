import { useSearchParams } from 'next/navigation';

export interface RoomParams {
  userId: number | null;
  userName: string | null;
  instrument: string | null;
  isValid: boolean;
  error: string | null;
}

export function useRoomParams(): RoomParams {
  const searchParams = useSearchParams();

  const userIdParam = searchParams.get('user_id');
  const userName = searchParams.get('name');
  const instrument = searchParams.get('instrument');

  // Validate user_id
  let userId: number | null = null;
  let error: string | null = null;

  if (!userIdParam) {
    error = 'Missing user_id parameter';
  } else {
    const parsed = parseInt(userIdParam, 10);
    if (isNaN(parsed) || parsed <= 0) {
      error = 'Invalid user_id parameter';
    } else {
      userId = parsed;
    }
  }

  // Validate name
  if (!error && !userName) {
    error = 'Missing name parameter';
  }

  // Validate instrument
  if (!error && !instrument) {
    error = 'Missing instrument parameter';
  }

  return {
    userId,
    userName,
    instrument,
    isValid: !error,
    error,
  };
}
