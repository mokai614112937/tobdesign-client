import Vue from 'vue'

const treeDataTransfer = (treeData, parentNode, level, expandedLevel, { nodeKey, parentKey, levelKey, childKey, expandedKey, lazy }) => {
  let tmp = []
  treeData.forEach(node => {
    if (parentNode) {
      Vue.set(node, parentKey, parentNode)
    }

    let _level = 0

    if (level !== undefined && level !== null) {
      _level = level + 1
    }

    Vue.set(node, levelKey, _level)

    let _expanded = expandedLevel === 'all' ? true : expandedLevel > _level

    if (lazy && node.hasOwnProperty(childKey) && _level > 0) {
      _expanded = false
      Vue.set(node, '_loading', false)
    }

    Vue.set(node, expandedKey, _expanded)

    tmp.push(node)
    if (node[childKey] && node[childKey].length > 0) {
      let _children = treeDataTransfer(node[childKey], node, _level, expandedLevel, { nodeKey, parentKey, levelKey, childKey, expandedKey, lazy })
      tmp = tmp.concat(_children)
    }
  })

  return tmp
}

const lazyDataTransfer = (data, parentNode, { nodeKey, parentKey, levelKey, childKey, expandedKey }) => {
  let _level = parentNode[levelKey] + 1

  data.forEach(node => {
    Vue.set(node, parentKey, parentNode)

    Vue.set(node, levelKey, _level)

    if (node.hasOwnProperty(childKey)) {
      Vue.set(node, '_loading', false)
    }

    Vue.set(node, expandedKey, false)
  })

  parentNode[childKey] = data
  parentNode[expandedKey] = true
  parentNode['_loading'] = false
}

export {
  treeDataTransfer,
  lazyDataTransfer
}
