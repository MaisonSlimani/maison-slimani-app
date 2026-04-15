import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useCart } from '../../lib/hooks/useCart'
import { CartItem } from '@maison/domain'

// Mock analytics to prevent firing external events during test
vi.mock('../../lib/analytics', () => ({
  trackAddToCart: vi.fn(),
}))

describe('useCart Hook', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('should initialize empty cart on first load', () => {
    const { result } = renderHook(() => useCart())
    expect(result.current.items).toEqual([])
    expect(result.current.totalItems).toBe(0)
    expect(result.current.total).toBe(0)
  })

  it('should update local storage upon addItem', async () => {
    const { result } = renderHook(() => useCart())

    const mockItem: CartItem = {
      id: 'test-1',
      name: 'Sneaker',
      price: 100,
      quantity: 1,
      image_url: null,
      color: 'Rouge',
      size: '42'
    }

    await act(async () => {
      await result.current.addItem(mockItem, false)
    })

    expect(result.current.items.length).toBe(1)
    expect(result.current.items[0].name).toBe('Sneaker')
    
    // Verify persistence
    const saved = JSON.parse(localStorage.getItem('cart_v2') || '[]')
    expect(saved.length).toBe(1)
    expect(saved[0].id).toBe('test-1')
  })

  it('should sync state across components', async () => {
    // Render two instances of the hook (simulating two components on screen)
    const hook1 = renderHook(() => useCart())
    const hook2 = renderHook(() => useCart())

    const mockItem: CartItem = {
      id: 'test-sync',
      name: 'Slipper',
      price: 50,
      quantity: 1,
      image_url: null,
    }

    await act(async () => {
      await hook1.result.current.addItem(mockItem, false)
    })

    // hook2 should have received the notification and updated its state automatically
    expect(hook2.result.current.items.length).toBe(1)
    expect(hook2.result.current.items[0].id).toBe('test-sync')
  })

  it('should handle removing an item with sizing properly', async () => {
    const { result } = renderHook(() => useCart())
    const item1: CartItem = { id: 'multi-test', name: 'Bag', price: 50, quantity: 1, image_url: null, color: 'Blue' }
    const item2: CartItem = { id: 'multi-test', name: 'Bag', price: 50, quantity: 1, image_url: null, color: 'Red' }

    await act(async () => {
      await result.current.addItem(item1, false)
      await result.current.addItem(item2, false)
    })

    expect(result.current.items.length).toBe(2)

    act(() => {
      // Remove only the Red one
      result.current.removeItem('multi-test', 'Red', undefined)
    })

    expect(result.current.items.length).toBe(1)
    expect(result.current.items[0].color).toBe('Blue')
  })
})
