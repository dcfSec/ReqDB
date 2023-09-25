import { useEffect, useState } from 'react';
import Form from 'react-bootstrap/Form';
import { inFilterField } from '../MiniComponents';

export default function FilterTopicEntry({topic, filteredTopics, setFilteredTopics, search, root=false}) {

  let allChildren = getAllChildren(topic, [])

  const [allChecked, setAllChecked] = useState(true);

  useEffect(() => { includesAll(filteredTopics, allChildren) ?  setAllChecked(true) : setAllChecked(false) }, [filteredTopics]);

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
      setFilteredTopics([ ...filteredTopics, ...allChildren ])
    } else {
      setFilteredTopics(filteredTopics.filter(n => !allChildren.includes(n)));
    }
  }

  function includesAll(a, b) {
    if (topic.children.length === 0) {
      return b.every(r=> a.includes(r))
    } else {
      return b.filter(n => n !== `${topic.key} ${topic.title}`).every(r=> a.includes(r))
    }
  }

  return (search === "" || inFilterField(search, allChildren)) ? 
    <li className='no-bullets'>
      <Form.Check key={`${topic.key} ${topic.title}`} id={`${topic.key} ${topic.title}`} type="switch" label={root ? `${topic.title}` : `${topic.key} - ${topic.title}`} style={{paddingLeft:"1.5em"}} onChange={toggleAll} checked={allChecked}/>
      <ul>{topic.children.map((child, index) => ((search === "" || inFilterField(search, getAllChildren(child, []))) ? <FilterTopicEntry key={index} topic={child} search={search} filteredTopics={filteredTopics} setFilteredTopics={setFilteredTopics} /> : null))}</ul>
    </li> : null

}