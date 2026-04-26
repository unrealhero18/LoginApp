import { validateLogin } from '../validation';

describe('validateLogin', () => {
  it('should return no errors for valid credentials', () => {
    const values = { username: 'testuser', password: 'password123' };
    const errors = validateLogin(values);
    expect(errors).toEqual({});
  });

  it('should return error for empty username', () => {
    const values = { username: '', password: 'password123' };
    const errors = validateLogin(values);
    expect(errors.username).toBe('Username is required');
  });

  it('should return error for too short username', () => {
    const values = { username: 'ab', password: 'password123' };
    const errors = validateLogin(values);
    expect(errors.username).toBe('Username is invalid');
  });

  it('should return error for empty password', () => {
    const values = { username: 'testuser', password: '' };
    const errors = validateLogin(values);
    expect(errors.password).toBe('Password is required');
  });

  it('should return multiple errors if both fields are invalid', () => {
    const values = { username: '', password: '' };
    const errors = validateLogin(values);
    expect(errors.username).toBe('Username is required');
    expect(errors.password).toBe('Password is required');
  });
});
