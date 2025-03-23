import * as React from 'react';
import { TableVirtuoso } from 'react-virtuoso';

// Replace:
// <Table
//   width={width}
//   height={height}
//   headerHeight={20}
//   rowHeight={30}
//   rowCount={rows.length}
//   rowGetter={({ index }) => rows[index]}
// >
//   <Column
//     label='Name'
//     dataKey='name'
//     width={100}
//   />
//   <Column
//     label='Age'
//     dataKey='age'
//     width={50}
//   />
// </Table>

// With:
<TableVirtuoso
  style={{ height: height, width: width }}
  data={rows}
  fixedHeaderContent={() => (
    <tr>
      <th style={{ width: 100 }}>Name</th>
      <th style={{ width: 50 }}>Age</th>
    </tr>
  )}
  itemContent={(index, row) => (
    <>
      <td>{row.name}</td>
      <td>{row.age}</td>
    </>
  )}
/> 
