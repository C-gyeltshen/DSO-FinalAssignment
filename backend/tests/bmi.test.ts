/// <reference types="jest" />
import request from 'supertest'
import app from '../src/app'

describe('BMI API', () => {
  it('should create a new BMI record', async () => {
    const res = await request(app)
      .post('/api/create/bmi')
      .send({
        id: Math.floor(Math.random() * 1000000),
        height: 1.75,
        weight: 70,
        age: 25,
        bmi: 22.86
      })
      .set('Accept', 'application/json')

    expect(res.status).toBe(201)
    expect(res.body).toHaveProperty('id')
    expect(res.body.height).toBe(1.75)
    expect(res.body.weight).toBe(70)
    expect(res.body.age).toBe(25)
    expect(res.body.bmi).toBeCloseTo(22.86)
  })

  it('should fail with missing fields', async () => {
    const res = await request(app)
      .post('/api/create/bmi')
      .send({
        height: 1.75,
        weight: 70,
        age: 25
        // bmi missing
      })
      .set('Accept', 'application/json')

    expect(res.status).toBe(400)
    expect(res.body).toHaveProperty('message', 'Missing required fields')
  })
})
