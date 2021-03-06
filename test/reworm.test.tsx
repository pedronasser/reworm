import React, { Component, Fragment } from 'react'
import { create, Provider } from '../src/reworm'
import { shallow, mount } from 'enzyme'

describe('State', () => {
  it('should create a new state', () => {
    const state = create()

    expect(state).toBeDefined()
    expect(typeof state.get).toEqual('function')
    expect(typeof state.set).toEqual('function')
    expect(typeof state.select).toEqual('function')
  })

  it('should access state using get', () => {
    const initial = ['John', 'Michael']
    const users = create(initial)
    const userList = jest.fn(s => s.map(user => <div key={user}>{user}</div>))

    const Users = () => <Fragment>{users.get(userList)}</Fragment>
    const App = () => (
      <Provider>
        <Users />
      </Provider>
    )

    const result = shallow(<App />)

    expect(result.html()).toBe('<div>John</div><div>Michael</div>')
    expect(userList).toHaveBeenCalled()
    expect(userList).toHaveBeenCalledWith(initial)
  })

  it('should access state using selectors', () => {
    const initial = { list: ['John', 'Michael'] }
    const users = create(initial)
    const usersList = jest.fn(state => state.list)
    const renderUser = jest.fn(users => users.map(user => <div>{user}</div>))
    const usersSelector = users.select(usersList)

    const johnSelector = users.select(s => s.list.find(u => u.includes('John')))

    const Users = () => <Fragment>{usersSelector(renderUser)}</Fragment>
    const John = () => <Fragment>{johnSelector(u => u)}</Fragment>

    const App = () => (
      <Provider>
        <Fragment>
          <Users />
          <John />
        </Fragment>
      </Provider>
    )

    const result = shallow(<App />)

    expect(result.html()).toBe('<div>John</div><div>Michael</div>John')
    expect(usersList).toHaveBeenCalled()
    expect(usersList).toHaveBeenCalledWith(initial)
    expect(renderUser).toHaveBeenCalled()
    expect(renderUser).toHaveBeenCalledWith(initial.list)
  })

  it('should modify state', () => {
    const initial = { name: 'John' }
    const user = create(initial)

    const Users = () => <div>{user.get(s => s.name)}</div>

    class App extends Component {
      public componentDidMount(): void {
        user.set({ name: 'Peter' })
      }
      public render(): React.ReactNode {
        return (
          <Provider>
            <div>
              <Users />
              {user.get(s => (
                <input
                  value={s.name}
                  onChange={ev => user.set({ name: ev.target.value })}
                />
              ))}
            </div>
          </Provider>
        )
      }
    }

    const result = mount(<App />)
    const input = result.find('input')
    expect(result.html()).toEqual(
      '<div><div>Peter</div><input value="Peter"></div>'
    )

    input.simulate('change', { target: { value: 'Michael' } })
    expect(result.html()).toEqual(
      '<div><div>Michael</div><input value="Michael"></div>'
    )
  })

  it('should modify state with primitive types', () => {
    const initial = 'John'
    const user = create(initial)

    const Users = () => <div>{user.get(val => val)}</div>
    const App = () => (
      <Provider>
        <div>
          <Users />
          {user.get(val => (
            <input value={val} onChange={ev => user.set(ev.target.value)} />
          ))}
        </div>
      </Provider>
    )

    const result = mount(<App />)
    const input = result.find('input')

    input.simulate('change', { target: { value: 'Michael' } })

    expect(result.html()).toEqual(
      '<div><div>Michael</div><input value="Michael"></div>'
    )
  })

  it('should trigger subscribe function', () => {
    const initial = 'John'
    const user = create(initial)

    class App extends Component {
      public state = { name: null }
      public componentDidMount(): void {
        user.subscribe(name => this.setState({ name }))
        user.set('Michael')
      }
      public render(): React.ReactNode {
        return <div>Hello {this.state.name}</div>
      }
    }

    const result = mount(<App />)

    expect(result.html()).toEqual('<div>Hello Michael</div>')
  })
})
