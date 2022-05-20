import http from 'k6/http';
import { check, group, sleep, fail } from 'k6';
import {randomIntBetween} from 'https://jslib.k6.io/k6-utils/1.1.0/index.js'

export const options = {
  stages: [
    { target: 30, duration: '1m' },
    { target: 30, duration: '30s' },
    { target: 0, duration: '10s' }
  ],
  thresholds: {
    'http_req_duration': ['p(95)<500', 'p(99)<1500']
  },
};

const BASE_URL = 'https://jsonplaceholder.typicode.com';

export default () => {
  let postIdNumber = randomIntBetween(1,20)

  group('Get all Posts - 1st Call',()=>{
    let URL = `${BASE_URL}/posts`
    const res = http.get(URL)
    check(res,{'response code was 200':(res)=>res.status==200})
  });
  sleep(5)

  group('Get Specific Post - 2nd Call',()=>{
    let URL = `${BASE_URL}/posts/${postIdNumber}`
    const res = http.get(URL)
    if(check(res,{'response code was 200':(res)=>res.status==200})){
      postIdNumber = res.json('id');
    }else{
      console.log(`Unable to get specific post number: ${postIdNumber}.  res status: ${res.status} res body:${res.body}`);
        return;
    }
  })
  sleep(randomIntBetween(1,20))

  group('Get Comments for above post - 3rd call ',()=>{
    let URL = `${BASE_URL}/posts/${postIdNumber}/comments`
    const res = http.get(URL)
    check(res,{'response code was 200':(res)=>res.status==200})
  })
  sleep(2)

  group('Add Comment for above post - 4th call ',()=>{
    let URL = `${BASE_URL}/posts/${postIdNumber}/comments`
    const payload ={
      name: "K6",
      email: "K6@test.com",
      body: "This is a simple comment"
    };
    const res = http.post(URL,payload)
    check(res,{'response code was 201':(res)=>res.status==201})
  })

  sleep(1);
}