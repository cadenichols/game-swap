/* jshint expr:true */

'use strict';

var expect = require('chai').expect;
var Lab = require('lab');
var lab = exports.lab = Lab.script();
var describe = lab.describe;
var Trade = require('../../server/models/trade')
var it = lab.it;
var beforeEach = lab.beforeEach;
var server = require('../../server/index');
var cp = require('child_process');
var dbname = process.env.MONGO_URL.split('/')[3];
var cookie;


describe('trade route', function() {
  beforeEach(function(done) {
    cp.execFile(__dirname + '/../scripts/clean-db.sh', [dbname], {cwd:__dirname + '/../scripts'}, function() {
      var options = {
        method: 'post',
        url:'/authenticate',
        payload:{
          userName:'BilboBaggins',
          password: '123'
        }
      };
      server.inject(options, function(response) {
        cookie = response.headers['set-cookie'][0].match(/peanutbutter=[^;]+/)[0];
        done();
      });
    });
  });
  describe('post /trades', function() {
    it('should create a new trade', function(done) {
      var options = {
        method: 'post',
        url:'/trades',
        payload:{
          item1: '0000000000000000000000a1',
          item2: '0000000000000000000000a2'
        },
        headers: {
          cookie: cookie  
        }
      };
      server.inject(options, function(response) {
        Trade.find({item1:'0000000000000000000000a1'}, function(err, trade) {
          expect(response.statusCode).to.equal(200);
          done();
        });
      });
    });
  });
  describe('get /trades', function() {
    it('should display a users open trades', function(done) {
      var options = {
        method: 'get',
        url:'/trades',
        headers: {
          cookie: cookie
        }
      };
      server.inject(options, function(response) {
        expect(response.result.length).to.equal(2);
        expect(response.statusCode).to.equal(200);
        done();
      });
    });
  });
  describe('post /trades/approve', function() {
    it('should approve a proposed trade', function(done) {
      var options = {
        method: 'post',
        url:'/trades/approve',
        payload: {
          tradeId: '000000000000000000000a01'
        },
        headers: {
          cookie: cookie
        }
      };
      server.inject(options, function(response) {
        Trade.findById('000000000000000000000a01', function(err, trade) {
          expect(trade.isSuccess).to.be.ok;
          expect(trade.isCompleted).to.be.ok;
          expect(response.statusCode).to.equal(200);
          done();
        });
      });
    });
  });
  describe('post /trades/decline', function() {
    it('should decline a proposed trade', function(done) {
      var options = {
        method: 'post',
        url:'/trades/decline',
        payload: {
          tradeId: '000000000000000000000a01'
        },
        headers: {
          cookie: cookie
        }
      };
      server.inject(options, function(response) {
        Trade.findById('000000000000000000000a01', function(err, trade) {
          expect(trade.isSuccess).to.not.be.ok;
          expect(trade.isCompleted).to.be.ok;
          expect(response.statusCode).to.equal(200);
          done();
        });
      });
    });
  });
});
