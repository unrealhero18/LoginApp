import { renderHook, act } from '@testing-library/react-native';

import { useForm } from '../useForm';

describe('useForm', () => {
  const initialValues = { username: '', password: '' };
  const onSubmit = jest.fn() as jest.Mock<void, [typeof initialValues]>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with initial values', () => {
    const { result } = renderHook(() =>
      useForm({ initialValues, onSubmit })
    );

    expect(result.current.values).toEqual(initialValues);
  });

  it('should update values when handleChange is called', () => {
    const { result } = renderHook(() =>
      useForm({ initialValues, onSubmit })
    );

    act(() => {
      result.current.handleChange('username')('testuser');
    });

    expect(result.current.values.username).toBe('testuser');
  });

  it('should call onSubmit with current values when handleSubmit is called', () => {
    const { result } = renderHook(() =>
      useForm({ initialValues, onSubmit })
    );

    act(() => {
      result.current.handleChange('username')('testuser');
      result.current.handleChange('password')('password123');
    });

    act(() => {
      result.current.handleSubmit();
    });

    expect(onSubmit).toHaveBeenCalledWith({
      username: 'testuser',
      password: 'password123',
    });
  });

  it('should call onValueChange when a field value changes', () => {
    const onValueChange = jest.fn();
    const { result } = renderHook(() =>
      useForm({ initialValues, onSubmit, onValueChange })
    );

    act(() => {
      result.current.handleChange('username')('testuser');
    });

    expect(onValueChange).toHaveBeenCalled();
  });

  it('should return correct errors state based on validate function on submit', () => {
    const validate = (values: typeof initialValues) => {
      const errors: Partial<Record<keyof typeof initialValues, string>> = {};
      if (!values.username) errors.username = 'Username is required';
      if (!values.password) errors.password = 'Password is required';
      return errors;
    };

    const { result } = renderHook(() =>
      useForm<typeof initialValues>({ initialValues, onSubmit, validate }),
    );

    expect(result.current.isValid).toBe(false);
    expect(result.current.errors).toEqual({});

    act(() => {
      result.current.handleSubmit();
    });

    expect(result.current.isValid).toBe(false);
    expect(result.current.errors.username).toBe('Username is required');
    expect(onSubmit).not.toHaveBeenCalled();

    act(() => {
      result.current.handleChange('username')('testuser');
      result.current.handleChange('password')('password123');
    });

    // Errors are cleared automatically on change
    expect(result.current.errors.username).toBeUndefined();

    act(() => {
      result.current.handleSubmit();
    });

    expect(result.current.isValid).toBe(true);
    expect(result.current.errors).toEqual({});
    expect(onSubmit).toHaveBeenCalledWith({
      username: 'testuser',
      password: 'password123',
    });
  });

  it('should return correct isComplete state', () => {
    const { result } = renderHook(() => useForm({ initialValues, onSubmit }));

    expect(result.current.isComplete).toBe(false);

    act(() => {
      result.current.handleChange('username')('t');
    });
    expect(result.current.isComplete).toBe(false);

    act(() => {
      result.current.handleChange('password')('p');
    });
    expect(result.current.isComplete).toBe(true);
  });

  it('should consider 0 and false as complete values', () => {
    const { result } = renderHook(() =>
      useForm({
        initialValues: { count: 0, active: false },
        onSubmit: jest.fn(),
      }),
    );

    // If we use Boolean(), these would be false. 
    // They should be true (complete) for numeric/boolean fields.
    expect(result.current.isComplete).toBe(true);
  });

  it('should maintain errors reference if the field being changed has no error', () => {
    const { result } = renderHook(() =>
      useForm({ initialValues, onSubmit })
    );

    const initialErrors = result.current.errors;

    act(() => {
      result.current.handleChange('username')('test');
    });

    // Reference should be identical to avoid unnecessary re-renders
    expect(result.current.errors).toBe(initialErrors);
  });

  it('should reset values and errors when reset is called', () => {
    const { result } = renderHook(() =>
      useForm({ initialValues, onSubmit })
    );

    act(() => {
      result.current.handleChange('username')('newuser');
      result.current.reset();
    });

    expect(result.current.values).toEqual(initialValues);
    expect(result.current.errors).toEqual({});
  });

  it('should reset errors when resetErrors is called', () => {
    const validate = () => ({ username: 'error' });
    const { result } = renderHook(() =>
      useForm({ initialValues, onSubmit, validate }),
    );

    act(() => {
      result.current.handleSubmit();
    });

    expect(result.current.errors.username).toBe('error');

    act(() => {
      result.current.resetErrors();
    });

    expect(result.current.errors).toEqual({});
  });
});
