const flavors = ['Sweet & fruity', 'Sour & refreshing', 'Bitter & bold', 'Smooth & creamy']
const vibes = ['Fun and energetic', 'Chill and easy-going', 'Bold and adventurous', 'Classy and sophisticated']
const styles = ['Light and refreshing', 'Fruity and easy to drink', 'Strong with a noticeable kick', 'Something unique and different']

export function validQuizAnswers(answers) {
  return Boolean(answers && flavors.includes(answers.flavor) && vibes.includes(answers.vibe) &&
    styles.includes(answers.style) && Number.isInteger(answers.strength) && answers.strength >= 1 && answers.strength <= 5)
}

export function getAccountProfile(user) {
  return {
    name: typeof user?.user_metadata?.display_name === 'string' ? user.user_metadata.display_name : '',
    email: user?.email || '',
    quizAnswers: validQuizAnswers(user?.user_metadata?.quiz_answers) ? user.user_metadata.quiz_answers : null,
  }
}

export function createAccountService(client) {
  const auth = () => {
    if (!client) throw new Error('Account access needs a valid Supabase project URL and publishable key.')
    return client.auth
  }
  const unwrap = ({ data, error }) => {
    if (error) throw error
    return data
  }
  return {
    async signUp({ email, password, name, redirectTo }) {
      if (!name.trim()) throw new Error('Please enter your name.')
      return unwrap(await auth().signUp({
        email: email.trim(), password,
        options: { data: { display_name: name.trim() }, emailRedirectTo: redirectTo },
      }))
    },
    async signIn({ email, password }) {
      return unwrap(await auth().signInWithPassword({ email: email.trim(), password }))
    },
    async resendConfirmation(email, redirectTo) {
      return unwrap(await auth().resend({ type: 'signup', email, options: { emailRedirectTo: redirectTo } }))
    },
    async saveProfile(name) {
      if (!name.trim()) throw new Error('Please enter your name.')
      return unwrap(await auth().updateUser({ data: { display_name: name.trim() } })).user
    },
    async saveQuiz(answers) {
      if (!validQuizAnswers(answers)) throw new Error('Please answer all four quiz questions.')
      const quizAnswers = { flavor: answers.flavor, vibe: answers.vibe, style: answers.style, strength: answers.strength }
      return unwrap(await auth().updateUser({ data: { quiz_answers: quizAnswers } })).user
    },
    async signOut() {
      const { error } = await auth().signOut({ scope: 'local' })
      if (error) throw error
    },
  }
}
