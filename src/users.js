import React from "react";

import ApolloClient from "apollo-boost";
import { ApolloProvider, Query, Mutation } from "react-apollo";
import gql from "graphql-tag";

const client = new ApolloClient({
	uri: "http://localhost:4000/"
});

const GET_USERS = gql`
	{
		users {
			_id
			firstName
			lastName
			userName
			email
			job {
				title
				company
				companyUrl
			}
			created
			lastUpdated
		}
	}
`;

const ADD_USER = gql`
	mutation AddNewUser($firstName: String!, $lastName: String!, $userName: String!, $email: String!, $password: String!) {
		addNewUser(firstName: $firstName, lastName:$lastName, userName:$userName, email:$email, password:$password) {
			_id
			firstName
			lastName
			userName
			email
			job {
				company
				companyUrl
				title
			}
			created
			lastUpdated
		}
	}
`;

const Users = () => (
	<Query query={GET_USERS}>
		{({ loading, error, data }) => {
			console.log(data);
			if (loading) return <p>Loading...</p>;
			if (error) return <p>Error :(</p>;

			return data.users.map(({ _id, firstName, userName, lastName, job }) => {
				return (
					<div key={_id}>
						<h3>{firstName} {lastName}</h3>
						<h5>username: {userName}</h5>
						{job.map(job => (<p key={firstName + " " + job.title +  " - " + job.company}>Job: {job.title} at {job.company} / {job.companyUrl}</p>))}
					</div>
				);
			});
		}}
	</Query>
);

const AddUser = () => {
	let firstName;
	let lastName;
	let userName;
	let email;
	let password;

	return (
		<Mutation mutation={ADD_USER}
			update={(cache, { data: { addNewUser } }) => {
				const { users } = cache.readQuery({ query: GET_USERS });
				cache.writeQuery({
					query: GET_USERS,
					data: { users: users.concat([addNewUser]) },
				});
			}}>
			{(addNewUser, { data, loading, error }) => (
				<div>
					<form
						align="center"
						onSubmit={e => {
							e.preventDefault();
							addNewUser({
								variables:
								{
									firstName: firstName.value,
									lastName: lastName.value,
									userName: userName.value,
									email: email.value,
									password: password.value
								}
							});
							firstName.value = "";
							lastName.value = "";
							userName.value = "";
							email.value = "";
							password.value = "";
						}}
					>
						<input placeholder="first name" ref={node => { firstName = node; }} /><br/>
						<input placeholder="last name" ref={node => { lastName = node; }} /><br/>
						<input placeholder="username" ref={node => { userName = node; }} /><br/>
						<input placeholder="email" type="email" ref={node => { email = node; }} /><br/>
						<input placeholder="password" type="password" ref={node => { password = node; }} /><br/>

						<button type="submit">create user</button>
					</form>
					{loading && <p>Loading...</p>}
					{error && <p>Error :( Please try again</p>}
				</div>
			)}
		</Mutation>
	);
};


const App = () => {
	return (
		<ApolloProvider client={client} >
			<div>
				<Users />
				<AddUser />
			</div>
		</ApolloProvider >
	)
};

export default App;
