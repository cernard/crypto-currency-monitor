import React, { useContext, useState, useEffect, useRef } from 'react';
import { Table, Input, Select, Popconfirm, Form, message, Spin } from 'antd';
import { MenuOutlined } from '@ant-design/icons';
import { FormInstance } from 'antd/lib/form';
import {
  SortableContainer,
  SortableElement,
  SortableHandle,
} from 'react-sortable-hoc';
import arrayMove from 'array-move';
import Store from 'electron-store';
import { ipcRenderer } from 'electron';
import { ping, fetchMarkets, Markets } from '../utils/ccxt_util';
import config from '../config';

const store = new Store();

const EditableContext = React.createContext<FormInstance<any> | null>(null);
const MarketsContext = React.createContext<BaseAndQuotes[]>([
  {
    base: 'TEST',
    quotes: [],
  },
]);
interface Item {
  key: string;
  base: string;
  quote: string;
  pp: number;
  amount: number;
  exchange: string;
}

interface EditableRowProps {
  index: number;
}
interface EditableCellProps {
  title: React.ReactNode;
  editable: boolean;
  children: React.ReactNode;
  dataIndex: keyof Item;
  record: Item;
  handleSave: (record: Item) => void;
}

const { Option } = Select;

const EditableCell: React.FC<EditableCellProps> = ({
  editable,
  children,
  dataIndex,
  record,
  handleSave,
  ...restProps
}) => {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<Input>(null);
  const form = useContext(EditableContext)!;
  const markets = useContext(MarketsContext);

  useEffect(() => {
    if (editing) {
      inputRef.current!.focus();
    }
  }, [editing]);

  const toggleEdit = () => {
    setEditing(!editing);
    form.setFieldsValue({ [dataIndex]: record[dataIndex] });
  };

  const save = async () => {
    try {
      const values = await form.validateFields();

      toggleEdit();
      handleSave({ ...record, ...values });
    } catch (errInfo) {
      console.log('Save failed:', errInfo);
    }
  };

  let childNode = children;
  let editableChild = null;
  if (editable) {
    switch (dataIndex) {
      case 'base':
        editableChild = (
          <Form.Item
            style={{ margin: 0 }}
            name={dataIndex}
            rules={[
              {
                required: true,
                message: `Base is required.`,
              },
            ]}
          >
            <Select ref={inputRef} onBlur={save} showSearch>
              {markets.map((market) => (
                <Option value={market.base} key={market.base}>
                  {market.base}
                </Option>
              ))}
            </Select>
          </Form.Item>
        );
        break;
      case 'quote':
        editableChild = (
          <Form.Item
            style={{ margin: 0 }}
            name={dataIndex}
            rules={[
              {
                required: true,
                message: `Quote is required.`,
              },
            ]}
          >
            <Select ref={inputRef} onBlur={save} showSearch>
              <Option value="BTC">BTC</Option>
              <Option value="USDT">USDT</Option>
            </Select>
          </Form.Item>
        );
        break;
      case 'pp':
        editableChild = (
          <Form.Item
            style={{ margin: 0 }}
            name={dataIndex}
            rules={[
              {
                required: false,
              },
            ]}
          >
            <Input
              ref={inputRef}
              onPressEnter={save}
              onBlur={save}
              type="number"
            />
          </Form.Item>
        );
        break;
      case 'amount':
        editableChild = (
          <Form.Item
            style={{ margin: 0 }}
            name={dataIndex}
            rules={[
              {
                required: false,
              },
            ]}
          >
            <Input
              ref={inputRef}
              onPressEnter={save}
              onBlur={save}
              type="number"
            />
          </Form.Item>
        );
        break;
      case 'exchange':
        editableChild = (
          <Form.Item
            style={{ margin: 0 }}
            name={dataIndex}
            rules={[
              {
                required: true,
                message: `Exchange is required.`,
              },
            ]}
          >
            <Select ref={inputRef} onBlur={save} showSearch>
              <Option value="auto">Auto</Option>
              <Option value="biance">Biance</Option>
            </Select>
          </Form.Item>
        );
        break;
      default:
        editableChild = <>Unsupport field</>;
    }
    childNode = editing ? (
      editableChild
    ) : (
      <div style={{ paddingRight: 24 }} onClick={toggleEdit}>
        {children}
      </div>
    );
  }

  return <td {...restProps}>{childNode}</td>;
};

type EditableTableProps = Parameters<typeof Table>[0];

interface DataType {
  key: React.Key;
  base: string;
  quote: string;
  pp: number;
  amount: number;
  exchange: string;
  index: number;
}

interface EditableTableState {
  dataSource: DataType[];
  count: number;
  markets: BaseAndQuotes[];
  isMarketsLoading: boolean;
}

type ColumnTypes = Exclude<EditableTableProps['columns'], undefined>;
const DragHandle = SortableHandle(() => (
  <MenuOutlined style={{ cursor: 'grab', color: '#999' }} />
));
const SortableItem = SortableElement((props) => <EditableRow {...props} />);
const TBodySortableContainer = SortableContainer((props) => (
  <tbody {...props} />
));

const EditableRow: React.FC<EditableRowProps> = ({ index, ...props }) => {
  const [form] = Form.useForm();
  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  );
};
interface QuoteAndExchages {
  quote: string;
  exchanges: string[];
}
interface BaseAndQuotes {
  base: string;
  quotes: QuoteAndExchages[];
}
class EditableTable extends React.Component<
  EditableTableProps,
  EditableTableState
> {
  columns: (ColumnTypes[number] & { editable?: boolean; dataIndex: string })[];

  constructor(props: EditableTableProps) {
    super(props);

    this.columns = [
      {
        title: 'Sort',
        dataIndex: 'sort',
        width: 70,
        className: 'drag-visible',
        render: () => <DragHandle />,
      },
      {
        title: 'Base',
        dataIndex: 'base',
        editable: true,
      },
      {
        title: 'Quote',
        dataIndex: 'quote',
        editable: true,
      },
      {
        title: 'Purchase price',
        dataIndex: 'pp',
        editable: true,
      },
      {
        title: 'Amount',
        dataIndex: 'amount',
        editable: true,
      },
      {
        title: 'Exchange',
        dataIndex: 'exchange',
        editable: true,
      },
      {
        title: 'operation',
        dataIndex: 'operation',
        render: (_, record: { key: React.Key }) =>
          this.state.dataSource.length >= 1 ? (
            <Popconfirm
              title="Sure to delete?"
              onConfirm={() => this.handleDelete(record.key)}
            >
              <a>Delete</a>
            </Popconfirm>
          ) : null,
      },
    ];

    this.state = {
      dataSource: [
        // {
        //   key: 0,
        //   base: 'Edward King 0',
        //   quote: '32',
        //   pp: 0.2455,
        //   amount: 32,
        //   exchange: 'auto',
        //   index: 0
        // }
      ],
      count: 2,
      markets: [],
      isMarketsLoading: false,
    };
  }

  handleDelete = (key: React.Key) => {
    const dataSource = [...this.state.dataSource];
    this.setState({
      dataSource: dataSource.filter((item) => item.key !== key),
    });
  };

  handleAdd = () => {
    const { count, dataSource } = this.state;
    const newData: DataType = {
      key: count,
      base: 'BTC',
      quote: 'USDT',
      pp: 0,
      amount: 0,
      exchange: 'auto',
      index: count,
    };
    this.setState({
      dataSource: [...dataSource, newData],
      count: count + 1,
    });
  };

  handleSave = (row: DataType) => {
    const newData = [...this.state.dataSource];
    const index = newData.findIndex((item) => row.key === item.key);
    const item = newData[index];
    newData.splice(index, 1, {
      ...item,
      ...row,
    });
    this.setState({ dataSource: newData });
  };

  updateExchanges = async () => {
    this.setState({ isMarketsLoading: true });
    message.info('Checking valid exchanges...');
    const { validExchanges } = await ping();
    const exchanges: string[] = validExchanges.map(
      (exchange) => exchange.exchange
    );
    message.info('Loading markets data...');
    await fetchMarkets(exchanges, (exchangeMarkets: Markets[]) => {
      const markets: BaseAndQuotes[] = [];
      exchangeMarkets.forEach((exchangeMarket) =>
        exchangeMarket.markets.forEach((market) => {
          let pair: BaseAndQuotes = markets.filter(
            (p) => p.base === market.base
          )[0];
          if (pair === undefined) {
            pair = {
              base: market.base,
              quotes: [],
            };
            markets.push(pair);
          }
          let quote: QuoteAndExchages = pair.quotes.filter(
            (q) => q.quote === market.quote
          )[0];
          if (quote === undefined) {
            quote = {
              quote: market.quote,
              exchanges: [],
            };
            pair.quotes.push(quote);
          }
          let exchange: string = quote.exchanges.filter(
            (e) => e === exchangeMarket.exchange
          )[0];
          if (exchange === undefined) {
            exchange = exchangeMarket.exchange;
            quote.exchanges.push(exchange);
          }
        })
      );
      this.setState({ markets, isMarketsLoading: false });
      // store.set(config.MARKETS, markets);
      // ipcRenderer.send('updateMarkets');
    });
  };

  onSortEnd = ({ oldIndex, newIndex }) => {
    const { dataSource } = this.state;
    if (oldIndex !== newIndex) {
      const newData = arrayMove(
        [].concat(dataSource),
        oldIndex,
        newIndex
      ).filter((el) => !!el);
      this.setState({ dataSource: newData });
    }
  };

  DraggableContainer = (props) => (
    <TBodySortableContainer
      useDragHandle
      disableAutoscroll
      helperClass="row-dragging"
      onSortEnd={this.onSortEnd}
      {...props}
    />
  );

  DraggableBodyRow = ({ className, style, ...restProps }) => {
    const { dataSource } = this.state;
    // function findIndex base on Table rowKey props and should always be a right array index
    const index = dataSource.findIndex(
      (x) => x.index === restProps['data-row-key']
    );
    return <SortableItem index={index} {...restProps} />;
  };

  render() {
    const { dataSource, markets, isMarketsLoading } = this.state;
    const components = {
      body: {
        wrapper: this.DraggableContainer,
        row: this.DraggableBodyRow,
        // row: EditableRow,
        cell: EditableCell,
      },
    };
    const columns = this.columns.map((col) => {
      if (!col.editable) {
        return col;
      }
      return {
        ...col,
        onCell: (record: DataType) => ({
          record,
          editable: col.editable,
          dataIndex: col.dataIndex,
          title: col.title,
          handleSave: this.handleSave,
        }),
      };
    });
    return (
      <div>
        <MarketsContext.Provider value={markets}>
          <button
            type="button"
            className="btn btn-default"
            style={{ margin: 10, float: 'right' }}
            onClick={this.updateExchanges}
          >
            <Spin spinning={isMarketsLoading} size="small">
              Update exchanges
            </Spin>
          </button>
        </MarketsContext.Provider>
        <button
          type="button"
          className="btn btn-primary"
          style={{ margin: 10, float: 'right' }}
          onClick={this.handleAdd}
        >
          Add one
        </button>
        <Table
          sticky
          components={components}
          bordered
          pagination={false}
          dataSource={dataSource}
          columns={columns as ColumnTypes}
        />
      </div>
    );
  }
}

export default EditableTable;
