/**
 * Created by filipac on 19/05/2017.
 */
const template = (message) => {
  return `<div class="cg-busy cg-busy-backdrop cg-busy-backdrop-animation cg-busy-delete"></div>
          <div class="cg-busy cg-busy-animation cg-busy-delete">
            <div class="cg-busy-default-wrapper">

              <div class="cg-busy-default-sign">

                <div class="cg-busy-default-spinner">
                  <div class="bar1"></div>
                  <div class="bar2"></div>
                  <div class="bar3"></div>
                  <div class="bar4"></div>
                  <div class="bar5"></div>
                  <div class="bar6"></div>
                  <div class="bar7"></div>
                  <div class="bar8"></div>
                  <div class="bar9"></div>
                  <div class="bar10"></div>
                  <div class="bar11"></div>
                  <div class="bar12"></div>
                </div>

                <div class="cg-busy-default-text">${message}</div>

              </div>

            </div>
          </div>`
}
/* eslint-disable no-undef, no-unused-vars */
import { factory as busyFactory } from './busy-factory'
import j from 'jqlite'
import b from './busy.css'
const tracker = busyFactory()
import { debounce } from './debounce'
export default {
  bind: function (el, binding, vnode) {
  },
  update: function(el, binding, vnode) {
    debounce(()=>{
      const hideIt = function () {
        let els = el.querySelectorAll('.cg-busy-delete');
        for (let i = 0; i < els.length; ++i) {
          let e = els[i];
          e.parentNode.removeChild(e)
        }
        j(el).css('position', j(el).data('original-position'))
      }
      if (!binding.value || !binding.value.promise) return
      if (tracker.isPromise(binding.value.promise)) {
        const position = j(el).css('position')
        if (position !== 'relative') {
          j(el).data('original-position', position)
          j(el).css('position', 'relative')
        }
        j(el).prepend(template(binding.value.text))
        binding.value.promise.then(function (a) {
          hideIt()
        }, function (b) {
          hideIt()
        })
      }
    })()
  }
}
