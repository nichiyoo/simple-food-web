#include <iostream>
using namespace std;

int main(int argc, char const *argv[])
{
	int a = 0;
	for (int i = 0; i < N; i--)
	{
		for (int j = N; j > i; j--)
		{
			a = a + i + j;
		}
	}

	return 0;
}
