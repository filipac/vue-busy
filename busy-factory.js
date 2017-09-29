/**
 * Created by filipac on 19/05/2017.
 */
import { forEach } from 'lodash'
export function factory () {
  var tracker = {}
  tracker.promises = []
  tracker.delayPromise = null
  tracker.durationPromise = null
  tracker.delayJustFinished = false

  tracker.reset = function (options) {
    tracker.minDuration = options.minDuration

    tracker.promises = []
    forEach(options.promises, function (p) {
      if (!p || p.$cgBusyFulfilled) {
        return
      }
      addPromiseLikeThing(p)
    })

    if (tracker.promises.length === 0) {
      // if we have no promises then dont do the delay or duration stuff
      return
    }

    tracker.delayJustFinished = false
  }

  tracker.isPromise = function (promiseThing) {
    var then = promiseThing && (promiseThing.then || promiseThing.$then ||
      (promiseThing.$promise && promiseThing.$promise.then))

    return typeof then !== 'undefined'
  }

  tracker.callThen = function (promiseThing, success, error) {
    var promise
    if (promiseThing.then || promiseThing.$then) {
      promise = promiseThing
    } else if (promiseThing.$promise) {
      promise = promiseThing.$promise
    }

    var then = (promise.then || promise.$then)

    then.call(promise, success, error)
  }

  var addPromiseLikeThing = function (promise) {
    if (!tracker.isPromise(promise)) {
      throw new Error('cgBusy expects a promise (or something that has a .promise or .$promise')
    }

    if (tracker.promises.indexOf(promise) !== -1) {
      return
    }
    tracker.promises.push(promise)

    tracker.callThen(promise, function () {
      promise.$cgBusyFulfilled = true
      if (tracker.promises.indexOf(promise) === -1) {
        return
      }
      tracker.promises.splice(tracker.promises.indexOf(promise), 1)
    }, function () {
      promise.$cgBusyFulfilled = true
      if (tracker.promises.indexOf(promise) === -1) {
        return
      }
      tracker.promises.splice(tracker.promises.indexOf(promise), 1)
    })
  }

  tracker.active = function () {
    if (tracker.delayPromise) {
      return false
    }

    if (!tracker.delayJustFinished) {
      if (tracker.durationPromise) {
        return true
      }
      return tracker.promises.length > 0
    } else {
      // if both delay and min duration are set,
      // we don't want to initiate the min duration if the
      // promise finished before the delay was complete
      tracker.delayJustFinished = false
      if (tracker.promises.length === 0) {
        tracker.durationPromise = null
      }
      return tracker.promises.length > 0
    }
  }

  return tracker

}
