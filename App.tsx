import { Ionicons } from '@expo/vector-icons';
import {
  createBottomTabNavigator,
  BottomTabNavigationProp,
} from '@react-navigation/bottom-tabs';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer';
import {
  CompositeNavigationProp,
  getFocusedRouteNameFromRoute,
  NavigationContainer,
  NavigationProp,
  RouteProp,
  useNavigation,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import React, { createContext, useContext, useMemo, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import OtpVerificationScreen from './src/otp/OtpVerificationScreen';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

type Task = {
  id: string;
  title: string;
  category: string;
  due: string;
  completed: boolean;
  priority: 'High' | 'Normal';
  color: string;
};

type RootStackParamList = {
  Workspace: undefined;
  TaskDetail: { task: Task };
  NewTask: undefined;
};

type DrawerParamList = {
  MainTabs: undefined;
  About: undefined;
};

type TabParamList = {
  Today: undefined;
  Tasks: undefined;
  Insights: undefined;
};

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

const initialTasks: Task[] = [
  {
    id: '1',
    title: 'Review navigation assignment',
    category: 'Study',
    due: 'Today · 10:00 AM',
    completed: false,
    priority: 'High',
    color: '#DDF0DA',
  },
  {
    id: '2',
    title: 'Prepare project presentation',
    category: 'University',
    due: 'Today · 2:30 PM',
    completed: false,
    priority: 'Normal',
    color: '#FCE8D5',
  },
  {
    id: '3',
    title: 'Read React Navigation docs',
    category: 'Learning',
    due: 'Tomorrow',
    completed: false,
    priority: 'Normal',
    color: '#E5E3FA',
  },
  {
    id: '4',
    title: 'Organize weekly notes',
    category: 'Personal',
    due: 'Yesterday',
    completed: true,
    priority: 'Normal',
    color: '#F9E3E6',
  },
];

type TaskContextValue = {
  tasks: Task[];
  addTask: (title: string, category: string) => void;
  toggleTask: (id: string) => void;
};

const TaskContext = createContext<TaskContextValue | null>(null);

function useTasks() {
  const value = useContext(TaskContext);
  if (!value) {
    throw new Error('useTasks must be used inside TaskContext.Provider');
  }
  return value;
}

const Stack = createNativeStackNavigator<RootStackParamList>();
const Drawer = createDrawerNavigator<DrawerParamList>();
const Tab = createBottomTabNavigator<TabParamList>();
type WorkspaceNavigation = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList>,
  NavigationProp<RootStackParamList>
>;
const palette = {
  ink: '#202C28',
  muted: '#77817B',
  green: '#3E765B',
  paleGreen: '#E9F1E8',
  canvas: '#F7F8F4',
  line: '#E8EBE5',
  white: '#FFFFFF',
};

export default function App() {
  const [verified, setVerified] = useState(false);
  if (!verified) {
    return (
      <>
        <StatusBar style="dark" />
        <OtpVerificationScreen onVerified={() => setVerified(true)} />
      </>
    );
  }
  return <MainApp />;
}

function MainApp() {
  const [tasks, setTasks] = useState(initialTasks);

  const taskActions = useMemo<TaskContextValue>(
    () => ({
      tasks,
      addTask: (title, category) => {
        const newTask: Task = {
          id: Date.now().toString(),
          title,
          category,
          due: 'Today · Added just now',
          completed: false,
          priority: 'Normal',
          color: '#DDF0DA',
        };
        setTasks((current) => [newTask, ...current]);
      },
      toggleTask: (id) => {
        setTasks((current) =>
          current.map((task) =>
            task.id === id ? { ...task, completed: !task.completed } : task,
          ),
        );
      },
    }),
    [tasks],
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <TaskContext.Provider value={taskActions}>
        <NavigationContainer>
          <StatusBar style="dark" />
          <Stack.Navigator
            screenOptions={{
              headerStyle: { backgroundColor: palette.canvas },
              headerTintColor: palette.ink,
              headerTitleStyle: { fontSize: 17, fontWeight: '700' },
              headerShadowVisible: false,
              contentStyle: { backgroundColor: palette.canvas },
            }}
          >
            <Stack.Screen
              name="Workspace"
              component={WorkspaceDrawer}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="TaskDetail"
              component={TaskDetailScreen}
              options={({ route }) => ({
                title: 'Task details',
                headerRight: () => (
                  <TaskCompleteHeaderButton taskId={route.params.task.id} />
                ),
              })}
            />
            <Stack.Screen
              name="NewTask"
              component={NewTaskScreen}
              options={({ navigation }) => ({
                title: 'New task',
                headerRight: () => (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Cancel adding a task"
                    onPress={() => navigation.goBack()}
                    hitSlop={12}
                  >
                    <Text style={styles.headerLink}>Cancel</Text>
                  </Pressable>
                ),
              })}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </TaskContext.Provider>
    </GestureHandlerRootView>
  );
}

function WorkspaceDrawer() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => (
        <View style={styles.drawer}>
          <View style={styles.drawerBrand}>
            <View style={styles.brandMark}>
              <Ionicons name="checkmark" size={20} color={palette.white} />
            </View>
            <View>
              <Text style={styles.brandName}>daymark</Text>
              <Text style={styles.brandCaption}>MAKE ROOM FOR TODAY</Text>
            </View>
          </View>
          <DrawerContentScrollView {...props} contentContainerStyle={styles.drawerList}>
            <Text style={styles.drawerSection}>YOUR SPACE</Text>
            <DrawerItemList {...props} />
          </DrawerContentScrollView>
          <View style={styles.drawerFooter}>
            <Text style={styles.drawerFooterText}>A little progress adds up.</Text>
          </View>
        </View>
      )}
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: palette.canvas },
        headerTintColor: palette.ink,
        headerTitleStyle: { fontSize: 17, fontWeight: '700' },
        headerShadowVisible: false,
        drawerStyle: { backgroundColor: palette.white, width: 296 },
        drawerActiveTintColor: palette.green,
        drawerInactiveTintColor: palette.muted,
        drawerActiveBackgroundColor: palette.paleGreen,
        drawerLabelStyle: { fontSize: 14, fontWeight: '600' },
        drawerItemStyle: { borderRadius: 12, marginHorizontal: 10 },
        drawerIcon: ({ color, size }) => {
          const icon: React.ComponentProps<typeof Ionicons>['name'] =
            route.name === 'About' ? 'information-circle-outline' : 'grid-outline';
          return <Ionicons name={icon} size={size} color={color} />;
        },
      })}
    >
      <Drawer.Screen
        name="MainTabs"
        component={WorkspaceTabs}
        options={({ route, navigation }) => ({
          title: getWorkspaceTitle(route),
          drawerLabel: 'My workspace',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="grid-outline" size={size} color={color} />
          ),
          headerRight: () => (
            <AddTaskHeaderButton
              onPress={() =>
                navigation
                  .getParent<NavigationProp<RootStackParamList>>()
                  ?.navigate('NewTask')
              }
            />
          ),
        })}
      />
      <Drawer.Screen
        name="About"
        component={AboutScreen}
        options={{ title: 'About Daymark', drawerLabel: 'About' }}
      />
    </Drawer.Navigator>
  );
}

function getWorkspaceTitle(route: RouteProp<DrawerParamList, 'MainTabs'>) {
  const screen = getFocusedRouteNameFromRoute(route) ?? 'Today';
  const titles: Record<string, string> = {
    Today: 'Today',
    Tasks: 'My tasks',
    Insights: 'Your progress',
  };
  return titles[screen] ?? 'Today';
}

function WorkspaceTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: palette.green,
        tabBarInactiveTintColor: '#97A09B',
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
        tabBarIcon: ({ color, size, focused }) => {
          const icons: Record<keyof TabParamList, [IoniconName, IoniconName]> = {
            Today: ['sunny-outline', 'sunny'],
            Tasks: ['checkbox-outline', 'checkbox'],
            Insights: ['stats-chart-outline', 'stats-chart'],
          };
          const names = icons[route.name as keyof TabParamList];
          return (
            <Ionicons
              name={focused ? names[1] : names[0]}
              size={size}
              color={color}
            />
          );
        },
      })}
    >
      <Tab.Screen name="Today" component={TodayScreen} />
      <Tab.Screen name="Tasks" component={TasksScreen} />
      <Tab.Screen name="Insights" component={InsightsScreen} />
    </Tab.Navigator>
  );
}

function AddTaskHeaderButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Add a new task"
      onPress={onPress}
      hitSlop={12}
      style={styles.headerIconButton}
    >
      <Ionicons name="add" size={23} color={palette.green} />
    </Pressable>
  );
}

function TodayScreen() {
  const { tasks } = useTasks();
  const navigation = useNavigation<WorkspaceNavigation>();
  const activeTasks = tasks.filter((task) => !task.completed);

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <View style={styles.welcomeRow}>
        <View>
          <Text style={styles.eyebrow}>TUESDAY, OCTOBER 13</Text>
          <Text style={styles.pageTitle}>Make today count.</Text>
          <Text style={styles.subtitle}>Small steps, steady progress.</Text>
        </View>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>S</Text>
        </View>
      </View>

      <View style={styles.focusCard}>
        <View style={styles.focusTopRow}>
          <View style={styles.focusIcon}>
            <Ionicons name="leaf-outline" size={19} color={palette.green} />
          </View>
          <Text style={styles.focusLabel}>YOUR DAILY FOCUS</Text>
          <View style={styles.streakPill}>
            <Ionicons name="sparkles" size={13} color="#A76C22" />
            <Text style={styles.streakText}>3 day streak</Text>
          </View>
        </View>
        <Text style={styles.focusTitle}>One thing at a time.</Text>
        <Text style={styles.focusCopy}>
          You have {activeTasks.length} things on your list. You&apos;ve got this.
        </Text>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${tasks.length ? (tasks.filter((task) => task.completed).length / tasks.length) * 100 : 0}%` },
            ]}
          />
        </View>
        <Text style={styles.progressCaption}>
          {tasks.filter((task) => task.completed).length} of {tasks.length} tasks done
        </Text>
      </View>

      <View style={styles.sectionHeading}>
        <Text style={styles.sectionTitle}>Up next</Text>
        <Pressable onPress={() => navigation.navigate('Tasks')}>
          <Text style={styles.seeAll}>See all</Text>
        </Pressable>
      </View>
      {activeTasks.slice(0, 3).map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onPress={() => navigation.navigate('TaskDetail', { task })}
        />
      ))}
      {activeTasks.length === 0 && <EmptyState message="All done for today. Enjoy the breathing room!" />}

      <Pressable
        accessibilityRole="button"
        onPress={() => navigation.navigate('NewTask')}
        style={styles.addTaskCard}
      >
        <View style={styles.addTaskIcon}>
          <Ionicons name="add" size={20} color={palette.green} />
        </View>
        <Text style={styles.addTaskText}>Add something to your day</Text>
        <Ionicons name="arrow-forward" size={17} color={palette.muted} />
      </Pressable>
      <Text style={styles.footerNote}>A little progress adds up.</Text>
    </ScrollView>
  );
}

function TasksScreen() {
  const { tasks } = useTasks();
  const navigation = useNavigation<WorkspaceNavigation>();
  const [filter, setFilter] = useState<'All' | 'To do' | 'Done'>('All');
  const visibleTasks = tasks.filter((task) => {
    if (filter === 'To do') return !task.completed;
    if (filter === 'Done') return task.completed;
    return true;
  });

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <Text style={styles.eyebrow}>YOUR PERSONAL LIST</Text>
      <Text style={styles.pageTitle}>My tasks</Text>
      <Text style={styles.subtitle}>Everything you&apos;re working on, in one place.</Text>
      <View style={styles.filterRow}>
        {(['All', 'To do', 'Done'] as const).map((value) => (
          <Pressable
            key={value}
            onPress={() => setFilter(value)}
            style={[styles.filterChip, filter === value && styles.filterChipSelected]}
          >
            <Text style={[styles.filterText, filter === value && styles.filterTextSelected]}>
              {value}
            </Text>
          </Pressable>
        ))}
        <Text style={styles.taskCount}>{visibleTasks.length} tasks</Text>
      </View>
      {visibleTasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onPress={() => navigation.navigate('TaskDetail', { task })}
        />
      ))}
      {visibleTasks.length === 0 && <EmptyState message="Nothing here yet. Enjoy the quiet." />}
      <Pressable onPress={() => navigation.navigate('NewTask')} style={styles.addTaskCard}>
        <View style={styles.addTaskIcon}>
          <Ionicons name="add" size={20} color={palette.green} />
        </View>
        <Text style={styles.addTaskText}>Create a new task</Text>
        <Ionicons name="arrow-forward" size={17} color={palette.muted} />
      </Pressable>
    </ScrollView>
  );
}

function TaskCard({ task, onPress }: { task: Task; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open task: ${task.title}`}
      onPress={onPress}
      style={({ pressed }) => [styles.taskCard, pressed && styles.pressedCard]}
    >
      <View style={[styles.taskCheck, task.completed && styles.taskCheckDone]}>
        {task.completed && <Ionicons name="checkmark" size={14} color={palette.white} />}
      </View>
      <View style={styles.taskBody}>
        <Text style={[styles.taskTitle, task.completed && styles.taskTitleDone]} numberOfLines={2}>
          {task.title}
        </Text>
        <View style={styles.taskMeta}>
          <View style={[styles.categoryDot, { backgroundColor: task.color }]} />
          <Text style={styles.taskCategory}>{task.category}</Text>
          <Text style={styles.metaSeparator}>·</Text>
          <Text style={styles.taskDue}>{task.due}</Text>
        </View>
      </View>
      {task.priority === 'High' && !task.completed && (
        <View style={styles.priorityPill}>
          <Text style={styles.priorityText}>HIGH</Text>
        </View>
      )}
      <Ionicons name="chevron-forward" size={17} color="#AAB1AB" />
    </Pressable>
  );
}

function TaskDetailScreen({
  route,
}: {
  route: { params: { task: Task } };
}) {
  const { tasks } = useTasks();
  const task = tasks.find((item) => item.id === route.params.task.id) ?? route.params.task;

  return (
    <ScrollView contentContainerStyle={styles.detailPage}>
      <View style={[styles.detailIcon, { backgroundColor: task.color }]}>
        <Ionicons name="leaf-outline" size={29} color={palette.green} />
      </View>
      <Text style={styles.eyebrow}>TASK DETAILS</Text>
      <Text style={styles.detailTitle}>{task.title}</Text>
      <View style={styles.detailStatusRow}>
        <View style={[styles.statusDot, task.completed && styles.statusDotDone]} />
        <Text style={styles.statusText}>{task.completed ? 'Completed' : 'In progress'}</Text>
      </View>

      <View style={styles.detailCard}>
        <DetailRow icon="pricetag-outline" label="Category" value={task.category} />
        <View style={styles.detailDivider} />
        <DetailRow icon="time-outline" label="When" value={task.due} />
        <View style={styles.detailDivider} />
        <DetailRow icon="flag-outline" label="Priority" value={task.priority} />
      </View>
      <View style={styles.tipCard}>
        <Ionicons name="sparkles-outline" size={18} color="#A76C22" />
        <Text style={styles.tipText}>
          {task.completed
            ? 'You made it happen. Take a moment to celebrate.'
            : 'Focus on this one thing. The rest can wait.'}
        </Text>
      </View>
      <View style={styles.routeParamNote}>
        <Ionicons name="code-slash-outline" size={15} color={palette.green} />
        <Text style={styles.routeParamText}>
          This screen received the selected task through route parameters.
        </Text>
      </View>
    </ScrollView>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  value: string;
}) {
  return (
    <View style={styles.detailRow}>
      <View style={styles.detailRowIcon}>
        <Ionicons name={icon} size={17} color={palette.green} />
      </View>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

function TaskCompleteHeaderButton({ taskId }: { taskId: string }) {
  const { tasks, toggleTask } = useTasks();
  const task = tasks.find((item) => item.id === taskId);
  const completed = task?.completed ?? false;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={completed ? 'Reopen task' : 'Mark task complete'}
      onPress={() => {
        toggleTask(taskId);
        Alert.alert(
          completed ? 'Task reopened' : 'Task completed',
          completed ? 'This task is back on your list.' : 'Nice work. Keep it up!',
        );
      }}
      hitSlop={12}
    >
      <Text style={styles.headerLink}>{completed ? 'Reopen' : 'Complete'}</Text>
    </Pressable>
  );
}

function NewTaskScreen() {
  const { addTask } = useTasks();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Personal');
  const categories = ['Personal', 'Study', 'University', 'Learning'];
  const canSave = title.trim().length > 0;

  function saveTask() {
    if (!canSave) {
      Alert.alert('Add a task name', 'Write a short title before saving your task.');
      return;
    }
    addTask(title.trim(), category);
    navigation.goBack();
  }

  return (
    <ScrollView contentContainerStyle={styles.formPage}>
      <View style={styles.formIntroIcon}>
        <Ionicons name="create-outline" size={22} color={palette.green} />
      </View>
      <Text style={styles.pageTitle}>Make it happen.</Text>
      <Text style={styles.subtitle}>Add one small step to your list.</Text>

      <Text style={styles.inputLabel}>TASK NAME</Text>
      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="e.g. Finish my assignment"
        placeholderTextColor="#A1AAA3"
        style={styles.titleInput}
        autoFocus
        returnKeyType="done"
        onSubmitEditing={saveTask}
        maxLength={80}
      />

      <Text style={[styles.inputLabel, styles.categoryLabel]}>ADD TO</Text>
      <View style={styles.categoryOptions}>
        {categories.map((item) => (
          <Pressable
            key={item}
            onPress={() => setCategory(item)}
            style={[styles.categoryOption, category === item && styles.categoryOptionSelected]}
          >
            <Text
              style={[
                styles.categoryOptionText,
                category === item && styles.categoryOptionTextSelected,
              ]}
            >
              {item}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.formTip}>
        <Ionicons name="bulb-outline" size={18} color="#A76C22" />
        <Text style={styles.formTipText}>Keep it simple. You can always add more details later.</Text>
      </View>
      <Pressable
        accessibilityRole="button"
        onPress={saveTask}
        style={[styles.saveButton, !canSave && styles.saveButtonDisabled]}
      >
        <Text style={styles.saveButtonText}>Add to my day</Text>
        <Ionicons name="arrow-forward" size={18} color={palette.white} />
      </Pressable>
    </ScrollView>
  );
}

function InsightsScreen() {
  const { tasks } = useTasks();
  const done = tasks.filter((task) => task.completed).length;
  const ratio = tasks.length ? Math.round((done / tasks.length) * 100) : 0;

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <Text style={styles.eyebrow}>LOOK HOW FAR YOU&apos;VE COME</Text>
      <Text style={styles.pageTitle}>Your progress</Text>
      <Text style={styles.subtitle}>A gentle reminder that your effort matters.</Text>
      <View style={styles.insightHero}>
        <View style={styles.ring}>
          <Text style={styles.ringValue}>{ratio}%</Text>
          <Text style={styles.ringLabel}>DONE</Text>
        </View>
        <Text style={styles.insightHeroTitle}>Progress over perfection.</Text>
        <Text style={styles.insightHeroCopy}>Every completed task is a promise you kept to yourself.</Text>
      </View>
      <View style={styles.statRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{done}</Text>
          <Text style={styles.statCaption}>Tasks completed</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{tasks.length - done}</Text>
          <Text style={styles.statCaption}>Still in progress</Text>
        </View>
      </View>
      <View style={styles.motivationCard}>
        <Ionicons name="heart-outline" size={19} color={palette.green} />
        <Text style={styles.motivationText}>You don&apos;t have to do it all. Just the next thing.</Text>
      </View>
    </ScrollView>
  );
}

function AboutScreen() {
  return (
    <ScrollView contentContainerStyle={styles.aboutPage}>
      <View style={styles.aboutMark}>
        <Ionicons name="checkmark" size={31} color={palette.white} />
      </View>
      <Text style={styles.aboutTitle}>Daymark</Text>
      <Text style={styles.aboutSubtitle}>A calmer way to get things done.</Text>
      <View style={styles.detailCard}>
        <Text style={styles.aboutSectionTitle}>Built for small wins</Text>
        <Text style={styles.aboutCopy}>
          Daymark is a little daily planner that helps you focus on what matters, one task at a time.
        </Text>
        <View style={styles.detailDivider} />
        <Text style={styles.aboutSectionTitle}>Navigation demo</Text>
        <Text style={styles.aboutCopy}>
          This app combines a Stack, Drawer, and Bottom Tab navigator. Open any task to see its
          details and the data passed to that screen.
        </Text>
      </View>
      <Text style={styles.footerNote}>Made for thoughtful days.</Text>
    </ScrollView>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon}>
        <Ionicons name="leaf-outline" size={23} color={palette.green} />
      </View>
      <Text style={styles.emptyText}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { paddingHorizontal: 22, paddingTop: 22, paddingBottom: 32 },
  welcomeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  eyebrow: { color: palette.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.2 },
  pageTitle: { color: palette.ink, fontSize: 27, fontWeight: '700', letterSpacing: -0.5, marginTop: 7 },
  subtitle: { color: palette.muted, fontSize: 13, lineHeight: 20, marginTop: 5 },
  avatar: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: '#E8EADB', borderWidth: 2, borderColor: palette.white },
  avatarText: { color: palette.green, fontWeight: '700', fontSize: 15 },
  focusCard: { marginTop: 24, padding: 19, borderRadius: 18, backgroundColor: '#EDF3E9' },
  focusTopRow: { flexDirection: 'row', alignItems: 'center' },
  focusIcon: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.white },
  focusLabel: { color: palette.green, fontSize: 9, fontWeight: '700', letterSpacing: 1, marginLeft: 9, flex: 1 },
  streakPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F7EBD9', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 5, gap: 4 },
  streakText: { fontSize: 10, color: '#976222', fontWeight: '600' },
  focusTitle: { marginTop: 15, fontSize: 19, fontWeight: '700', color: palette.ink },
  focusCopy: { marginTop: 5, color: palette.muted, fontSize: 12, lineHeight: 18 },
  progressTrack: { height: 6, backgroundColor: '#D6E2D2', borderRadius: 4, marginTop: 17, overflow: 'hidden' },
  progressFill: { height: 6, borderRadius: 4, backgroundColor: palette.green },
  progressCaption: { marginTop: 7, color: palette.muted, fontSize: 10 },
  sectionHeading: { marginTop: 27, marginBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { color: palette.ink, fontSize: 17, fontWeight: '700' },
  seeAll: { color: palette.green, fontSize: 12, fontWeight: '700' },
  taskCard: { minHeight: 75, backgroundColor: palette.white, borderRadius: 14, paddingHorizontal: 13, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', marginBottom: 9, borderWidth: 1, borderColor: '#F0F1ED' },
  pressedCard: { opacity: 0.75 },
  taskCheck: { width: 20, height: 20, borderRadius: 7, borderWidth: 1.5, borderColor: '#CFD7CE', marginRight: 11, alignItems: 'center', justifyContent: 'center' },
  taskCheckDone: { backgroundColor: palette.green, borderColor: palette.green },
  taskBody: { flex: 1, paddingRight: 7 },
  taskTitle: { color: palette.ink, fontSize: 13, fontWeight: '600', lineHeight: 18 },
  taskTitleDone: { color: '#959E96', textDecorationLine: 'line-through' },
  taskMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
  categoryDot: { width: 7, height: 7, borderRadius: 3.5, marginRight: 5 },
  taskCategory: { color: palette.muted, fontSize: 10 },
  metaSeparator: { color: '#A7AEA8', marginHorizontal: 5, fontSize: 11 },
  taskDue: { color: palette.muted, fontSize: 10 },
  priorityPill: { backgroundColor: '#F9E9E4', borderRadius: 5, paddingHorizontal: 6, paddingVertical: 4, marginRight: 7 },
  priorityText: { color: '#A05A43', fontSize: 8, fontWeight: '700', letterSpacing: 0.5 },
  addTaskCard: { minHeight: 55, marginTop: 7, borderRadius: 14, borderWidth: 1, borderStyle: 'dashed', borderColor: '#CCD6CC', paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center' },
  addTaskIcon: { width: 30, height: 30, borderRadius: 10, backgroundColor: palette.paleGreen, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  addTaskText: { color: palette.ink, fontSize: 12, fontWeight: '600', flex: 1 },
  footerNote: { textAlign: 'center', marginTop: 23, color: '#9BA49D', fontSize: 11, fontStyle: 'italic' },
  tabBar: { height: 66, paddingTop: 7, paddingBottom: 8, borderTopColor: palette.line, backgroundColor: palette.white },
  tabLabel: { fontSize: 10, fontWeight: '600' },
  drawer: { flex: 1, backgroundColor: palette.white },
  drawerBrand: { paddingHorizontal: 22, paddingTop: 60, paddingBottom: 22, flexDirection: 'row', alignItems: 'center', gap: 11, borderBottomColor: palette.line, borderBottomWidth: 1, marginBottom: 14 },
  brandMark: { width: 38, height: 38, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.green },
  brandName: { color: palette.ink, fontSize: 20, fontWeight: '700', letterSpacing: -0.4 },
  brandCaption: { color: palette.muted, fontSize: 8, fontWeight: '700', letterSpacing: 1, marginTop: 2 },
  drawerList: { paddingTop: 4 },
  drawerSection: { marginLeft: 28, marginBottom: 8, color: '#9AA39B', fontSize: 9, fontWeight: '700', letterSpacing: 1.2 },
  drawerFooter: { marginHorizontal: 22, paddingVertical: 17, borderTopColor: palette.line, borderTopWidth: 1 },
  drawerFooterText: { color: palette.muted, fontSize: 11, fontStyle: 'italic' },
  headerIconButton: { width: 34, height: 34, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.paleGreen, marginRight: 5 },
  headerLink: { color: palette.green, fontSize: 13, fontWeight: '700' },
  filterRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 22, marginBottom: 14 },
  filterChip: { paddingHorizontal: 13, paddingVertical: 8, borderRadius: 15, backgroundColor: '#ECEFE9' },
  filterChipSelected: { backgroundColor: palette.green },
  filterText: { color: palette.muted, fontSize: 11, fontWeight: '600' },
  filterTextSelected: { color: palette.white },
  taskCount: { marginLeft: 'auto', color: palette.muted, fontSize: 10 },
  emptyState: { alignItems: 'center', paddingVertical: 35, paddingHorizontal: 25 },
  emptyIcon: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.paleGreen, marginBottom: 12 },
  emptyText: { color: palette.muted, fontSize: 12, textAlign: 'center', lineHeight: 19 },
  detailPage: { padding: 23, paddingBottom: 36 },
  detailIcon: { width: 58, height: 58, borderRadius: 19, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  detailTitle: { color: palette.ink, fontSize: 26, fontWeight: '700', lineHeight: 33, marginTop: 8 },
  detailStatusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 13 },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#D69E5B', marginRight: 7 },
  statusDotDone: { backgroundColor: palette.green },
  statusText: { color: palette.muted, fontSize: 12 },
  detailCard: { backgroundColor: palette.white, borderRadius: 16, paddingHorizontal: 15, paddingVertical: 4, marginTop: 25, borderWidth: 1, borderColor: '#F0F1ED' },
  detailRow: { minHeight: 55, flexDirection: 'row', alignItems: 'center' },
  detailRowIcon: { width: 31, height: 31, borderRadius: 10, backgroundColor: palette.paleGreen, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  detailLabel: { flex: 1, color: palette.muted, fontSize: 12 },
  detailValue: { color: palette.ink, fontSize: 12, fontWeight: '600' },
  detailDivider: { height: 1, backgroundColor: palette.line },
  tipCard: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#F8F0E4', borderRadius: 13, padding: 13, marginTop: 15 },
  tipText: { flex: 1, color: '#7F653E', fontSize: 11, lineHeight: 17 },
  routeParamNote: { marginTop: 21, padding: 12, borderRadius: 12, backgroundColor: palette.paleGreen, flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  routeParamText: { flex: 1, color: '#52705B', fontSize: 10, lineHeight: 15 },
  formPage: { paddingHorizontal: 23, paddingTop: 21, paddingBottom: 35 },
  formIntroIcon: { width: 43, height: 43, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.paleGreen, marginBottom: 17 },
  inputLabel: { color: palette.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1, marginTop: 30, marginBottom: 9 },
  titleInput: { borderRadius: 13, borderWidth: 1, borderColor: '#E1E6DE', paddingHorizontal: 14, height: 52, color: palette.ink, backgroundColor: palette.white, fontSize: 13 },
  categoryLabel: { marginTop: 25 },
  categoryOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  categoryOption: { paddingHorizontal: 13, paddingVertical: 9, borderRadius: 12, backgroundColor: '#ECEFE9', borderWidth: 1, borderColor: 'transparent' },
  categoryOptionSelected: { backgroundColor: palette.paleGreen, borderColor: '#BDD0BF' },
  categoryOptionText: { color: palette.muted, fontSize: 11, fontWeight: '600' },
  categoryOptionTextSelected: { color: palette.green },
  formTip: { marginTop: 25, padding: 13, borderRadius: 13, backgroundColor: '#F8F0E4', flexDirection: 'row', alignItems: 'center', gap: 9 },
  formTipText: { flex: 1, color: '#7F653E', fontSize: 11, lineHeight: 17 },
  saveButton: { marginTop: 23, height: 51, borderRadius: 14, backgroundColor: palette.green, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9 },
  saveButtonDisabled: { opacity: 0.55 },
  saveButtonText: { color: palette.white, fontSize: 13, fontWeight: '700' },
  insightHero: { backgroundColor: '#EDF3E9', alignItems: 'center', padding: 22, borderRadius: 19, marginTop: 25 },
  ring: { width: 116, height: 116, borderRadius: 58, borderWidth: 7, borderColor: '#9DBBA0', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F5F8F2' },
  ringValue: { color: palette.green, fontSize: 28, fontWeight: '700' },
  ringLabel: { color: palette.muted, fontSize: 9, fontWeight: '700', letterSpacing: 1 },
  insightHeroTitle: { color: palette.ink, fontSize: 16, fontWeight: '700', marginTop: 17 },
  insightHeroCopy: { color: palette.muted, fontSize: 11, lineHeight: 17, textAlign: 'center', marginTop: 6 },
  statRow: { flexDirection: 'row', gap: 10, marginTop: 13 },
  statCard: { flex: 1, backgroundColor: palette.white, borderRadius: 15, padding: 15, borderWidth: 1, borderColor: '#F0F1ED' },
  statNumber: { color: palette.ink, fontSize: 24, fontWeight: '700' },
  statCaption: { color: palette.muted, fontSize: 10, marginTop: 4 },
  motivationCard: { marginTop: 13, padding: 15, borderRadius: 14, backgroundColor: palette.white, flexDirection: 'row', alignItems: 'center', gap: 10 },
  motivationText: { flex: 1, color: palette.ink, fontSize: 11, lineHeight: 17, fontWeight: '500' },
  aboutPage: { padding: 23, alignItems: 'center', paddingTop: 34 },
  aboutMark: { width: 65, height: 65, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.green },
  aboutTitle: { color: palette.ink, fontSize: 26, fontWeight: '700', marginTop: 15 },
  aboutSubtitle: { color: palette.muted, fontSize: 12, marginTop: 4 },
  aboutSectionTitle: { color: palette.ink, fontSize: 13, fontWeight: '700', marginVertical: 12 },
  aboutCopy: { color: palette.muted, fontSize: 12, lineHeight: 19, marginBottom: 13 },
});
