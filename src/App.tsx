import * as React from "react";
import { FlatList, SafeAreaView, StyleSheet, Text, View } from "react-native";
import produce, { Draft } from "immer";
import { Button } from "./Button";
import { evaluate } from "./Calculator";
import { memoize } from "./util";

interface Props {}

interface State {
  buffer: string;
  log: string[];
}

interface SideEffectFunc {
  (): void;
}

export default class App extends React.Component<Props, State> {
  state: State = { buffer: "", log: [] };
  buttonClickCache = new Map<string, SideEffectFunc>();
  log = React.createRef<FlatList<string>>();

  buttonClick = memoize<string, SideEffectFunc>((c: string) => () => {
    if (this.log.current) {
      this.log.current.scrollToOffset({ offset: 0 });
    }

    this.setState(
      produce(
        (draft: Draft<State>): void => {
          draft.buffer += c;
        }
      )
    );
  });

  backspace = () => {
    this.setState(
      produce(
        (draft: Draft<State>): void => {
          draft.buffer = draft.buffer.substring(0, draft.buffer.length - 1);
        }
      )
    );
  };

  clear = () => {
    this.setState(
      produce(
        (draft: Draft<State>): void => {
          draft.buffer = "";
        }
      )
    );
  };

  evaluate = () => {
    const buffer = this.state.buffer;

    if (buffer.length) {
      this.setState(
        produce((draft: Draft<State>) => {
          draft.buffer = "";
          draft.log.unshift(buffer);

          try {
            draft.log.unshift(evaluate(buffer).toString());
          } catch (e) {
            draft.log.unshift(typeof e === "string" ? e : "Error");
          }
        })
      );
    }
  };

  getIndex = (_: string, index: number) => {
    return index.toString();
  };

  renderLogItem = ({
    item,
    index
  }: {
    item: string;
    index: number;
  }): React.ReactElement<Text> => {
    return (
      <Text
        style={[
          styles.logText,
          index % 2 === 1 ? styles.logRight : null,
          index === 0 ? styles.buffer : null
        ]}
      >
        {item}
      </Text>
    );
  };

  render() {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.container}>
          <View style={styles.log}>
            <FlatList
              ref={this.log}
              data={[this.state.buffer || " ", ...this.state.log]}
              renderItem={this.renderLogItem}
              keyExtractor={this.getIndex}
              inverted
            />
          </View>
          <View style={styles.buttonRow}>
            <Button onClick={this.clear}>C</Button>
            <Button onClick={this.backspace}>&larr;</Button>
            <Button onClick={this.buttonClick("d")}>d</Button>
            <Button onClick={this.buttonClick("/")}>/</Button>
          </View>
          <View style={styles.buttonRow}>
            <Button onClick={this.buttonClick("7")}>7</Button>
            <Button onClick={this.buttonClick("8")}>8</Button>
            <Button onClick={this.buttonClick("9")}>9</Button>
            <Button onClick={this.buttonClick("*")}>*</Button>
          </View>
          <View style={styles.buttonRow}>
            <Button onClick={this.buttonClick("4")}>4</Button>
            <Button onClick={this.buttonClick("5")}>5</Button>
            <Button onClick={this.buttonClick("6")}>6</Button>
            <Button onClick={this.buttonClick("-")}>-</Button>
          </View>
          <View style={styles.buttonRow}>
            <Button onClick={this.buttonClick("1")}>1</Button>
            <Button onClick={this.buttonClick("2")}>2</Button>
            <Button onClick={this.buttonClick("3")}>3</Button>
            <Button onClick={this.buttonClick("+")}>+</Button>
          </View>
          <View style={styles.buttonRow}>
            <Button onClick={this.buttonClick("0")} width={3}>
              0
            </Button>
            <Button onClick={this.evaluate}>=</Button>
          </View>
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column"
  },
  buttonRow: {
    flex: 1,
    flexDirection: "row"
  },
  log: {
    flex: 2
  },
  logText: {
    fontSize: 22,
    paddingLeft: 25,
    paddingRight: 25
  },
  logRight: {
    textAlign: "right"
  },
  buffer: {
    paddingBottom: 25
  }
});
