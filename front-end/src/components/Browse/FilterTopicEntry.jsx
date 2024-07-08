import { useEffect, useState } from 'react';
import Form from 'react-bootstrap/Form';
import { inFilterField } from '../MiniComponents';

import { useSelector, useDispatch } from 'react-redux'
import { addTopicFilterSelected, removeTopicFilterSelected } from '../../stateSlices/BrowseSlice';

/**
 * Component for an item in the list for the topics filter modal
 * 
 * @param {object} props Props for the component: topic, filteredTopics, setFilteredTopics, search, root
 * @returns Returns a entry in the modal to filter topics
 */
export default function FilterTopicEntry({ topic, search, parents = [], root = false }) {


  const dispatch = useDispatch()
  const filteredTopics = useSelector(state => state.browse.topics.filterSelected)

  let allChildren = getAllChildren(topic, [])

  const [allChecked, setAllChecked] = useState(true);

  useEffect(() => {
    if (includesAll(filteredTopics, allChildren)) {
      setAllChecked(true)
    } else {
      setAllChecked(false)
      //dispatch(removeTopicFilterSelected([`${topic.key} ${topic.title}`]));
    }
  }, [filteredTopics]);

  function getAllChildren(t, arr) {
    arr.push(`${t.key} ${t.title}`)
    t.children.forEach(child => {
      getAllChildren(child, arr)
    })
    return arr
  }

  function toggleAll(changeEvent) {
    const { checked } = changeEvent.target;

    if (checked === true) {
      dispatch(addTopicFilterSelected([...allChildren]));
    } else {
      dispatch(removeTopicFilterSelected([...allChildren, ...parents]));
    }
  }

  function includesAll(a, b) {
    if (topic.children.length === 0) {
      return a.includes(`${topic.key} ${topic.title}`)
    } else {
      return b.filter(n => n !== `${topic.key} ${topic.title}`).every(r => a.includes(r))
    }
  }

  return (search === "" || inFilterField(search, allChildren)) ?
    <li className='no-bullets'>
      <Form.Check key={`${topic.key} ${topic.title}`} id={`${topic.key} ${topic.title}`} type="switch" label={root ? `${topic.title}` : `${topic.key} - ${topic.title}`} style={{ paddingLeft: "1.5em" }} onChange={toggleAll} checked={allChecked} />
      <ul>{topic.children.map((child, index) => ((search === "" || inFilterField(search, getAllChildren(child, []))) ? <FilterTopicEntry key={index} topic={child} parents={[...parents, `${topic.key} ${topic.title}`]}search={search} /> : null))}</ul>
    </li> : null
}
