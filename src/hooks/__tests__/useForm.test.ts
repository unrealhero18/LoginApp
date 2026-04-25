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

  it('should return correct isValid state based on validate function', () => {
    const validate = (values: typeof initialValues) =>
      values.username.length > 0 && values.password.length > 0;

    type HookProps = {
      valFunc: (values: typeof initialValues) => boolean;
    };

    const { result } = renderHook(
      ({ valFunc }: HookProps) => useForm<typeof initialValues>({ initialValues, onSubmit, validate: valFunc }),
      {
        initialProps: { valFunc: validate },
      }
    );

    expect(result.current.isValid).toBe(false);

    act(() => {
      result.current.handleChange('username')('testuser');
    });
    expect(result.current.isValid).toBe(false);

    act(() => {
      result.current.handleChange('password')('password123');
    });
    expect(result.current.isValid).toBe(true);
  });
});
