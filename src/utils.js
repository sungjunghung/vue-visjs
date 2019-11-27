//import { DataSet, DataView } from 'vis-data'

const arrayDiff = (arr1, arr2) => arr1.filter(x => arr2.indexOf(x) === -1)

const mountVisData = (vm, propName, DataSet, DataView) => {
  let data = vm[propName]
  // If data is DataSet or DataView we return early without attaching our own events
  if (!(vm[propName] instanceof DataSet || vm[propName] instanceof DataView)) {
    data = new DataSet(vm[propName])
    // Rethrow all events
    data.on('*', (event, properties, senderId) =>
      vm.$emit(`${propName}-${event}`, { event, properties, senderId })
    )
    // We attach deep watcher on the prop to propagate changes in the DataSet
    const callback = value => {
      if (Array.isArray(value)) {
        const newIds = new DataSet(value).getIds()
        const diff = arrayDiff(vm.visData[propName].getIds(), newIds)
        vm.visData[propName].update(value)
        vm.visData[propName].remove(diff)
      }
    }
    vm.$watch(propName, callback, {
      deep: true
    })
  }

  // Emitting DataSets back
  vm.$emit(`${propName}-mounted`, data)

  return data
}

const translateEvent = event => {
  return event.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
}

const observerClean = obj => {
  if (Array.isArray(obj)) {
    return obj.map(item => observerClean(item))
  } else if (Object.prototype.toString.call(obj) === '[object Date]') {
    return new Date(obj.valueOf())
  } else if (typeof obj === 'object' && obj !== null) {
    return Object.keys(obj).reduce(
      (res, e) => Object.assign(res, { [e]: observerClean(obj[e]) }),
      {}
    )
  } else {
    return obj
  }
}

export { arrayDiff, mountVisData, translateEvent, observerClean }